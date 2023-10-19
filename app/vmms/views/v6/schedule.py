import pytz
from copy import deepcopy
from datetime import datetime, date, timedelta
from dateutil.parser import parse as parse_date
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from vmms.models import Client, Event, Playlist, Program, PromotionFull
from vmms.permissions import IsManagementUser
from vmms.playlists import PlaylistQueueExecutor
from vmms.serializers import EventSerializer, PlaylistSerializer, ProgramSerializer, PromotionFullSerializer
from vmms.views.schedule import simple_schedule_for_period, simple_group_schedule_for_period


SCHEDULE_LENGTH_DAYS = 28

PROMO_URL_PREFIX = 'https://s3.eu-central-1.amazonaws.com/vmms-promotion-v1/tracks/'
PROMO_URL_POSTFIX = '.mp3'

@api_view(['GET'])
@permission_classes(tuple())
def get_schedule_v6(request):
    SONG_FIELDS_TO_REMOVE = [
        'cast', 'created_at', 'daytime', 'energy', 'fame', 'language',
        'mood', 'season', 'songs_*', 'speed', 'target_age', 'updated_at',
        'username', 'version', 'voice', 'tags',
    ]
    PLAYLIST_FIELDS_TO_REMOVE = [
        'color', 'exclude_tags', 'include_tags', 'filters', 'genres', 'prefix',
    ]
    PROGRAM_FIELDS_TO_REMOVE = [
        'color', 'prefix',
    ]

    key = request.GET.get('api_key')
    if key == None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    client = None
    try:
        client = Client.objects.get(api_key=key)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    content_request_only = 'content_request_only' in request.GET

    # Full response
    if not content_request_only:
        schedule_start = datetime.now(pytz.utc)
        schedule_end = schedule_start + timedelta(days=SCHEDULE_LENGTH_DAYS)

        client_contents = []
        playlists = []
        programs = []
        playlists_schedule = []

        events = simple_schedule_for_period(client, schedule_start, schedule_end)
        for group in client.clientgroup_set.all():
            events += simple_group_schedule_for_period(group, schedule_start, schedule_end)
        for event in events:
            if event.content.playlist:
                playlists_schedule.append({
                    'id': event.id,
                    'name': event.name,
                    'dates':  {
                        'start': event.start,
                        'end': event.end,
                        'repeating_end': event.repeating_end,
                    },
                    'repeat_every_n_weeks': event.repeat_every_n,
                    'high_priority': event.high_priority,
                    'last_modified': event.last_modified,
                    'repeating': event.repeating,
                    'playlist': event.content.playlist.id
                })
                if event.content.playlist not in playlists:
                    playlists.append(event.content.playlist)
            elif event.content.program:
                playlists_schedule.append({
                    'id': event.id,
                    'name': event.name,
                    'dates':  {
                        'start': event.start,
                        'end': event.end,
                        'repeating_end': event.repeating_end,
                    },
                    'repeat_every_n_weeks': event.repeat_every_n,
                    'high_priority': event.high_priority,
                    'last_modified': event.last_modified,
                    'repeating': event.repeating,
                    'program': event.content.program.id
                })
                if event.content.program not in programs:
                    programs.append(event.content.program)
                for pl in event.content.program.playlists.all():
                    if pl.playlist not in playlists:
                        playlists.append(pl.playlist)


        for client_content in client.contents.all():
            if client_content.content.program:
                if client_content.content.program not in programs:
                    programs.append(client_content.content.program)
                client_contents.append({
                    'type': 'program',
                    'id': client_content.content.program.id
                })
                for pl in client_content.content.program.playlists.all():
                    if pl.playlist not in playlists:
                        playlists.append(pl.playlist)
            elif client_content.content.playlist:
                if client_content.content.playlist not in playlists:
                    playlists.append(client_content.content.playlist)
                client_contents.append({
                    'type': 'playlist',
                    'id': client_content.content.playlist.id    
                })

        if client.basic_content.playlist:
            if client.basic_content.playlist not in playlists:
                playlists.append(client.basic_content.playlist)
            basic_content = {
                'type': 'playlist',
                'id': client.basic_content.playlist.id
            }
        elif client.basic_content.program:
            if client.basic_content.program not in programs:
                programs.append(client.basic_content.program)
            basic_content = {
                'type': 'program',
                'id': client.basic_content.program.id
            }
            for pl in client.basic_content.program.playlists.all():
                if pl.playlist not in playlists:
                    playlists.append(pl.playlist)

        serialized_playlists = PlaylistSerializer(playlists, many=True).data
        serialized_programs = ProgramSerializer(programs, many=True).data
        
        for sp in serialized_playlists:
            for field in PLAYLIST_FIELDS_TO_REMOVE:
                sp.pop(field, None)

        for sp in serialized_programs:
            for field in PROGRAM_FIELDS_TO_REMOVE:
                sp.pop(field, None)

        for i, sp in enumerate(serialized_playlists):
            songs = PlaylistQueueExecutor.fetch_songs_for_playlist_and_client(playlists[i], client)
            for song in songs:
                for field_to_remove in SONG_FIELDS_TO_REMOVE:
                    if '*' not in field_to_remove:
                        song.pop(field_to_remove, None)
                    else:
                        fields_to_remove = []
                        field_to_remove = field_to_remove.replace('*', '')
                        for song_field, _ in song.items():
                            if song_field.startswith(field_to_remove):
                                fields_to_remove.append(song_field)
                        for field in fields_to_remove:
                            song.pop(field)
            sp['songs'] = songs

        # Active content
        content_request = None
        if client.content_requests.all().count() > 0:
            content_request = client.content_requests.order_by('-time')[0]
            if content_request.content is not None:
                if content_request.content.playlist:
                    content_request = {
                        'id': content_request.id,
                        'time': content_request.time,
                        'content_type': 'playlist',
                        'content_id': content_request.content.playlist.id
                    }
                elif content_request.content.program:
                    content_request = {
                        'id': content_request.id,
                        'time': content_request.time,
                        'content_type': 'program',
                        'content_id': content_request.content.program.id
                    }

        # Volume request
        volume_request = None
        if client.volume_requests.all().count() > 0:
            volume_request = client.volume_requests.order_by('-time')[0]
            volume_request = {
                'id': volume_request.id,
                'time': volume_request.time,
                'volume': volume_request.volume
            }
            
        # Promotions
        ids = []
        for promo in client.promotions.all():
            ids.append(promo.promotion_id)

        promos = PromotionFull.objects.using('promotion-tool').filter(id__in=ids)

        serialized_promos = PromotionFullSerializer(promos, many=True).data

        for sp in serialized_promos:
            for track in sp['tracks']:
                track['full_url'] = PROMO_URL_PREFIX + track['hash'] + '-' + str(track['id']) + PROMO_URL_POSTFIX

        serialized_response = {
            'promotions': serialized_promos,
            'basic_content': basic_content,
            'playlists': serialized_playlists,
            'programs': serialized_programs,
            'schedule': playlists_schedule,
            'client_contents': client_contents,
            'content_request': content_request,
            'volume_request': volume_request
        }
    else:
        # Content request & volume request only response
        # Content request
        content_request = None
        if client.content_requests.all().count() > 0:
            content_request = client.content_requests.order_by('-time')[0]
            if content_request.content is not None:
                if content_request.content.playlist:
                    content_request = {
                        'id': content_request.id,
                        'time': content_request.time,
                        'content_type': 'playlist',
                        'content_id': content_request.content.playlist.id
                    }
                elif content_request.content.program:
                    content_request = {
                        'id': content_request.id,
                        'time': content_request.time,
                        'content_type': 'program',
                        'content_id': content_request.content.program.id
                    }
        
        # Volume request
        volume_request = None
        if client.volume_requests.all().count() > 0:
            volume_request = client.volume_requests.order_by('-time')[0]
            volume_request = {
                'id': volume_request.id,
                'time': volume_request.time,
                'volume': volume_request.volume
            }
        
        serialized_response = {
            'content_request': content_request,
            'volume_request': volume_request,
        }
    return Response(
        serialized_response
    )
