from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, Count
import pytz
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from vmms.models import (ProgramFolder, Program, Event,
                         ClientContent, Client, ProgramPreviewLink)
from vmms.permissions import IsMusicUser
from vmms.serializers import (ProgramFolderSerializer, ProgramSerializer,
                              ProgramShallowSerializer,
                              ProgramPreviewLinkSerializer,
                              ProgramPreviewLinkCreateUpdateSerializer)
from vmms.playlists import PlaylistQueueExecutor


@permission_classes((IsAuthenticated, IsMusicUser))
class ProgramFolderViewSet(viewsets.ModelViewSet):
    queryset = ProgramFolder.objects.all()
    serializer_class = ProgramFolderSerializer


class ProgramViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramSerializer

    def get_serializer_class(self):
        if self.action == 'list':
            return ProgramShallowSerializer
        return ProgramSerializer

    def get_queryset(self):
        SEARCH_FIELDS = ['name']
        query = self.request.query_params.get('query', None)
        limit = self.request.query_params.get('limit', None)
        cache_key = f'program-{query}-{limit}'
        cached_queryset = cache.get(cache_key)
        if cached_queryset is not None:
            return cached_queryset
        queryset = Program.objects.all()
        if query is not None:
            philter = None
            for field in SEARCH_FIELDS:
                new_philter = Q(**{field + '__icontains': query})
                if philter is None:
                    philter = new_philter
                else:
                    philter |= new_philter
            queryset = queryset.filter(philter)

        if limit is not None:
            limit = int(limit)
            queryset = queryset[:limit]
        cache.set(cache_key, queryset, 60 * 15) 
        return queryset


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsMusicUser,))
def program_dependents(request, id):
    # Events
    events = Event.objects.filter(content__program=id).filter(
        (
            ~Q(repeating='NO') &
            (
                Q(repeating_end=None) |
                (~Q(repeating_end=None) & Q(repeating_end__gte=datetime.now()))
            )
        ) |
        ((Q(repeating='NO')) &
            (
                (Q(end__gte=datetime.now()))
            )
        )
    )
    events_count = events.count()
    event_clients = []
    for event in events:
        event_clients.append({
            'id': event.client.id,
            'name': event.client.name
        })

    # Client content
    clients_content_count = ClientContent.objects.filter(content__program=id).count()
    clients_content_clients = []
    for content in ClientContent.objects.filter(content__program=id):
        clients_content_clients.append({
            'id': content.client.id,
            'name': content.client.name
        })

    # Client basic content
    clients_basic_content_count = Client.objects.filter(basic_content__program=id).count()
    clients_basic_content_clients = []
    for client in Client.objects.filter(basic_content__program=id):
        clients_basic_content_clients.append({
            'id': client.id,
            'name': client.name
        })

    return Response({
        'events': {
            'clients': event_clients,
            'count': events_count,
        },
        'client_content': {
            'clients': clients_content_clients,
            'count': clients_content_count,
        },
        'client_basic_content': {
            'clients': clients_basic_content_clients,
            'count': clients_basic_content_count,
        },
    })


@api_view(['POST'])
@permission_classes((IsAuthenticated, IsMusicUser,))
def program_preview(request):
    SORT_FIELDS = ['artist', 'title']
    SORT_DIRS = ['asc', 'desc']

    page = request.data.get('page', 1)
    page -= 1
    per_page = request.data.get('per_page', 25)
    sort_by = request.data.get('sort_by', None)
    if sort_by not in SORT_FIELDS:
        sort_by = None
    sort_dir = request.data.get('sort_dir', None)
    if sort_dir not in SORT_DIRS:
        sort_dir = None

    offset = page * per_page
    songs = PlaylistQueueExecutor.fetch_songs_program(
        request.data['playlistIds'],
        per_page, offset,
        sort_by, sort_dir)
    total = PlaylistQueueExecutor.fetch_songs_count_program(
        request.data['playlistIds']
    )
    return Response({
        'total': total,
        'songs': songs
    })


@api_view(['GET'])
@permission_classes(tuple())
def program_preview_link(request):
    sort_by = None
    sort_dir = None
    offset = None
    per_page = None

    link_name = request.query_params.get('name', None)
    if link_name is None:
        return Response('No program name provided', status=status.HTTP_400_BAD_REQUEST)

    link_name = link_name.replace("_", " ")
    program = None
    try:
        ppl = ProgramPreviewLink.objects.get(name__iexact=link_name)
        if datetime.now(pytz.utc) > ppl.expiration_date:
            return Response('Link expired', status=status.HTTP_400_BAD_REQUEST)
        program = ppl.program
    except ObjectDoesNotExist:
        return Response('No matching program', status=status.HTTP_400_BAD_REQUEST)

    playlistIds = []
    for playlist in program.playlists.all():
        playlistIds.append(playlist.playlist.id)

    songs = PlaylistQueueExecutor.fetch_songs_program(
        playlistIds,
        per_page, offset,
        sort_by, sort_dir)
    return Response({
        'songs': songs
    })


class ProgramPreviewLinkViewSet(viewsets.ModelViewSet):
    queryset = ProgramPreviewLink.objects.all()

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return ProgramPreviewLinkCreateUpdateSerializer
        return ProgramPreviewLinkSerializer


@api_view(['GET'])
def get_songs_count_for_programs(request):
    ids = request.query_params.get('ids', [])
    ids = ids.split(',')
    result = {}
    program = None
    count = None
    for program_id in ids:
        program = Program.objects.get(pk=program_id)
        count = PlaylistQueueExecutor.fetch_songs_count_for_program(program)
        result[program.id] = count
    return Response(result)
