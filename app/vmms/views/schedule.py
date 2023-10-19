import pytz
from copy import deepcopy
from datetime import datetime, date, timedelta
from dateutil import relativedelta
from dateutil.parser import parse as parse_date
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from vmms.models import Client, ClientGroup, Event, GroupEvent, Playlist, Program
from vmms.permissions import IsManagementUser
from vmms.playlists import PlaylistQueueExecutor
from vmms.serializers import EventSerializer, PlaylistSerializer, ProgramSerializer, \
                             GroupEventSerializer


SCHEDULE_LENGTH_DAYS = 28


def update_event_dates(new, start, end):
    event_time_delta = end - start
    initial_start = start
    new_start = datetime(
        year=new.year,
        month=new.month,
        day=new.day,
        hour=initial_start.hour,
        minute=initial_start.minute
    )
    new_end = new_start + event_time_delta
    new_start = pytz.utc.localize(new_start)
    new_end = pytz.utc.localize(new_end)
    return new_start, new_end


def copy_for_date(event, new_date):
    """We need to copy the time from the
    initial start date and d/m/y from current
    date and combine them and create a
    new start date, then calculate time diff
    for the event and create new event with
    new start and end that should then be
    added to the list returned by the API call.
    """

    new_start, new_end = update_event_dates(new_date, event.start, event.end)

    copied_event = clone(event)
    copied_event.start = new_start
    copied_event.end = new_end

    return copied_event


def simple_schedule_for_period(client, schedule_start, schedule_end):
    client_cond = Q(client=client) if not client.master_schedule_enabled else (Q(client=client) | Q(client_id=-1))

    scheduled_events = Event.objects.filter(
        client_cond,
        (
            ~Q(repeating='NO') &
            (
                Q(repeating_end=None) |
                (~Q(repeating_end=None) & Q(repeating_end__gte=schedule_start))
            )
        ) |
        ((Q(repeating='NO')) &
            (
                (Q(start__lte=schedule_end) & Q(end__gte=schedule_start))
            )
        )
    )
    events = []
    # Loop through all the events
    for event in scheduled_events:
        if event.repeating == 'DAY':
            event_start_date = event.start.date()
            schedule_start_date = schedule_start.date()
            if event_start_date <= schedule_start_date:
                if event.repeating_end is not None:
                    event_repeating_end_date = event.repeating_end.date()
                    if event_repeating_end_date >= schedule_start_date:
                        events.append(event)
                else:
                    events.append(event)
        else:
            events.append(event)
    return events


def simple_group_schedule_for_period(group, schedule_start, schedule_end):
    client_cond = Q(group=group)

    scheduled_events = GroupEvent.objects.filter(
        client_cond,
        (
            ~Q(repeating='NO') &
            (
                Q(repeating_end=None) |
                (~Q(repeating_end=None) & Q(repeating_end__gte=schedule_start))
            )
        ) |
        ((Q(repeating='NO')) &
            (
                (Q(start__lte=schedule_end) & Q(end__gte=schedule_start))
            )
        )
    )
    events = []
    # Loop through all the events
    for event in scheduled_events:
        if event.repeating == 'DAY':
            event_start_date = event.start.date()
            schedule_start_date = schedule_start.date()
            if event_start_date <= schedule_start_date:
                if event.repeating_end is not None:
                    event_repeating_end_date = event.repeating_end.date()
                    if event_repeating_end_date >= schedule_start_date:
                        events.append(event)
                else:
                    events.append(event)
        else:
            events.append(event)
    return events


def group_schedule_for_period(group, schedule_start, schedule_end):
    client_cond = Q(group=group)

    scheduled_events = GroupEvent.objects.filter(
        client_cond,
        Q(repeating='NO') |
        ((~Q(repeating='NO')) & (
            Q(start__lte=schedule_end) | Q(end__gte=schedule_start)
        ))
    )

    events = []
    event_dates = {}

    # Loop through all the events
    for event in scheduled_events:
        # Loop through all the days in schedule period
        # If event is repeating
        if event.repeating != 'NO':
            current_date = schedule_start
            end = schedule_end
            if event.repeating_end is not None:
                if event.repeating_end < schedule_end:
                    end = event.repeating_end
            while current_date <= end:
                if current_date.date() < event.start.date():
                    # Next day
                    current_date += timedelta(days=1)
                    continue
                does_repeat_today = False
                if event.repeating == 'DAY':
                    # Daily events occur every day, so
                    does_repeat_today = True
                elif event.repeating == 'WEEK':
                    # Weekly event
                    if event.repeat_every_n is not None:
                        does_repeat_today = (((event.start - current_date).days % (7 * event.repeat_every_n)) == 0)
                    else:
                        does_repeat_today = (((event.start - current_date).days % 7) == 0)
                elif event.repeating == 'MONTH':
                    # Monthly event
                    does_repeat_today = event.start.day == current_date.day
                if does_repeat_today:
                    if event not in events:
                        events.append(event)
                    if event.id not in event_dates:
                        event_dates[event.id] = []
                    new_start, new_end = update_event_dates(current_date, event.start, event.end)
                    event_dates[event.id].append({
                        'start': new_start,
                        'end': new_end
                    })
                # Next day
                current_date += timedelta(days=1)

        # Event is not repeating
        else:
            if event not in events:
                events.append(event)
                if event.id not in event_dates:
                    event_dates[event.id] = []
                event_dates[event.id].append({
                    'start': event.start,
                    'end': event.end
                })
    return events, event_dates


def get_event_dates(event, schedule_start, schedule_end):
    result = []
    if event.repeating != 'NO':
        current_date = schedule_start
        end = schedule_end
        if event.repeating_end is not None:
            if event.repeating_end < schedule_end:
                end = event.repeating_end
        while current_date <= end:
            if current_date.date() < event.start.date():
                # Next day
                current_date += timedelta(days=1)
                continue
            does_repeat_today = False
            if event.repeating == 'DAY':
                # Daily events occur every day, so
                does_repeat_today = True
            elif event.repeating == 'WEEK':
                # Weekly event
                if event.repeat_every_n is not None:
                    does_repeat_today = (((event.start - current_date).days % (7 * event.repeat_every_n)) == 0)
                else:
                    does_repeat_today = (((event.start - current_date).days % 7) == 0)
            elif event.repeating == 'MONTH':
                # Monthly event
                does_repeat_today = event.start.day == current_date.day
            if does_repeat_today:
                new_start, new_end = update_event_dates(current_date, event.start, event.end)
                result.append({
                    'start': new_start,
                    'end': new_end
                })
            # Next day
            current_date += timedelta(days=1)

    # Event is not repeating
    else:
        result.append({
            'start': event.start,
            'end': event.end
        })
    return result


def schedule_for_period(client, schedule_start, schedule_end):
    client_cond = Q(client=client) if not client.master_schedule_enabled else (Q(client=client) | Q(client_id=-1))

    scheduled_events = Event.objects.filter(
        client_cond,
        Q(repeating='NO') |
        ((~Q(repeating='NO')) & (
            Q(start__lte=schedule_end) | Q(end__gte=schedule_start)
        ))
    )

    client_groups = client.clientgroup_set.all()
    
    group_events_raw = []
    group_events = []
    group_event_dates = {}

    for group in client_groups:
        group_events_raw.extend(group.events.all())

    for event in group_events_raw:
        if event not in group_events:
            group_events.append(event)
        dates = get_event_dates(event, schedule_start, schedule_end)
        if event.id not in group_event_dates:
            group_event_dates[event.id] = []
        group_event_dates[event.id] += dates

    events = []
    event_dates = {}

    # Loop through all the events
    for event in scheduled_events:
        # Loop through all the days in schedule period
        # If event is repeating
        if event not in events:
            events.append(event)
        dates = get_event_dates(event, schedule_start, schedule_end)
        if event.id not in event_dates:
            event_dates[event.id] = []
        event_dates[event.id] += dates
    return events, event_dates, group_events, group_event_dates


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsManagementUser))
def get_schedule_for_period(request, id):
    client = Client.objects.get(pk=id)
    schedule_start = pytz.utc.localize(parse_date(request.query_params.get('schedule_start')))
    schedule_end = pytz.utc.localize(parse_date(request.query_params.get('schedule_end')))
    events, event_dates, group_events, group_event_dates = schedule_for_period(client, schedule_start, schedule_end)
    return Response({
        'group_event_dates': group_event_dates,
        'group_events': GroupEventSerializer(group_events, many=True).data,
        'event_dates': event_dates,
        'events': EventSerializer(events, many=True).data
    })


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsManagementUser))
def get_group_schedule_for_period(request, id):
    group = ClientGroup.objects.get(pk=id)
    schedule_start = pytz.utc.localize(parse_date(request.query_params.get('schedule_start')))
    schedule_end = pytz.utc.localize(parse_date(request.query_params.get('schedule_end')))
    events, event_dates = group_schedule_for_period(group, schedule_start, schedule_end)
    return Response({
        'event_dates': event_dates,
        'events': GroupEventSerializer(events, many=True).data
    })


@api_view(['GET'])
@permission_classes(tuple())
def get_schedule(request):
    key = request.GET.get('api_key')
    if key is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    client = None
    try:
        client = Client.objects.get(api_key=key)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_403_FORBIDDEN)
    
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
                'name': event.name,
                'dates':  {
                    'start': event.start,
                    'end': event.end,
                },
                'last_modified': event.last_modified,
                'repeating': event.repeating,
                'playlist': event.content.playlist.id
            })
            if event.content.playlist not in playlists:
                playlists.append(event.content.playlist)
        elif event.content.program:
            playlists_schedule.append({
                'name': event.name,
                'dates':  {
                    'start': event.start,
                    'end': event.end,
                },
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
    for i, sp in enumerate(serialized_playlists):
        songs = PlaylistQueueExecutor.fetch_songs_for_playlist_and_client(playlists[i], client)
        for song in songs:
            song.pop('tags')
        sp['songs'] = songs

    serialized_response = {
        'basic_content': basic_content,
        'playlists': serialized_playlists,
        'programs': serialized_programs,
        'schedule': playlists_schedule,
        'client_contents': client_contents
    }

    return Response(
        serialized_response
    )

