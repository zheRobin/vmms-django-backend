from datetime import datetime
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from vmms.serializers import PlaylistFilterSerializer, PlaylistFolderSerializer, \
                             PlaylistSerializer, PlaylistShallowSerializer, ExternalTagSerializer, \
                             CategorySerializer, ExternalGenreSerializer, ExternalCategorySerializer
from vmms.models import PlaylistFolder, Playlist, PlaylistFilter, ExternalTag, \
                        ExternalCategory, ExternalGenre, Event, ClientContent, Client, PLAYLIST_CONTENT_MODES, \
                        ProgramPlaylist
from vmms.permissions import IsMusicUser, IsManagementUser
from vmms.playlists import PlaylistQueueExecutor


@permission_classes((IsAuthenticated, IsMusicUser,))
class PlaylistFolderViewSet(viewsets.ModelViewSet):
    queryset = PlaylistFolder.objects.all()
    serializer_class = PlaylistFolderSerializer


class PlaylistViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action == 'list':
            return PlaylistShallowSerializer
        return PlaylistSerializer

    def get_queryset(self):
        SEARCH_FIELDS = ['name']
        exclude_manual = 'exclude_manual' in self.request.query_params
        query = self.request.query_params.get('query', None)
        queryset = Playlist.objects.all()
        if exclude_manual:
            queryset = queryset.filter(
                content_mode=PLAYLIST_CONTENT_MODES['FILTERS_AND_GENRES']
            )
        if query is not None:
            philter = None
            for field in SEARCH_FIELDS:
                new_philter = Q(**{field + '__icontains': query})
                if philter is None:
                    philter = new_philter
                else:
                    philter |= new_philter
            queryset = queryset.filter(philter)

        limit = self.request.query_params.get('limit', None)
        if limit is not None:
            limit = int(limit)
            queryset = queryset[:limit]
        return queryset


@api_view(['GET'])
@permission_classes((IsAuthenticated, IsMusicUser,))
def playlist_dependents(request, id):
    events_count = Event.objects.filter(content__playlist=id).filter(
        Q(repeating='NONE') & Q(start__gte=datetime.now()) |
        ~Q(repeating='NONE')
    ).count()
    clients_content_count = ClientContent.objects.filter(content__playlist=id).annotate(clients_count=Count('id'))
    if len(clients_content_count) > 0:
        clients_content_count = clients_content_count[0].clients_count
    else:
        clients_content_count = 0
    clients_basic_content_count = Client.objects.filter(basic_content__playlist=id).count()
    programs_with_playlist_count = ProgramPlaylist.objects.filter(playlist=id).count()
    programs_with_playlist = []
    for pp in ProgramPlaylist.objects.filter(playlist=id):
        programs_with_playlist.append({
            'id': pp.program.id,
            'name': pp.program.name,
        })

    return Response({
        'events_count': events_count,
        'client_content_count': clients_content_count,
        'client_basic_content_count': clients_basic_content_count,
        'programs_with_playlist': {
            'programs': programs_with_playlist,
            'count': programs_with_playlist_count,
        },
    })


@api_view(['POST'])
@permission_classes((IsAuthenticated, IsMusicUser,))
def playlist_preview(request):
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

    serializer = PlaylistFilterSerializer(data=request.data['filters'], many=True)
    if serializer.is_valid():
        offset = page * per_page
        filters_raw = serializer.validated_data
        filters = list(map(lambda f: PlaylistFilter(**f), filters_raw))
        songs = PlaylistQueueExecutor.fetch_songs_fg(
            filters, request.data['genres'],
            request.data['include_tags'], request.data['exclude_tags'],
            per_page, offset,
            sort_by, sort_dir)
        total = PlaylistQueueExecutor.fetch_songs_count_fg(
            filters, request.data['genres'],
            request.data['include_tags'], request.data['exclude_tags']
        )
        return Response({
            'total': total,
            'songs': songs
        })
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes((IsAuthenticated, IsMusicUser,))
class ExternalTagViewSet(viewsets.ModelViewSet):
    serializer_class = ExternalTagSerializer

    def get_queryset(self):
        SEARCH_FIELDS = ['name']
        query = self.request.query_params.get('query', None)
        queryset = ExternalTag.objects.using('import-tool').all()
        if query is not None:
            philter = None
            for field in SEARCH_FIELDS:
                new_philter = Q(**{field + '__icontains': query})
                if philter is None:
                    philter = new_philter
                else:
                    philter |= new_philter
            queryset = queryset.filter(philter)

        limit = self.request.query_params.get('limit', None)
        if limit is not None:
            limit = int(limit)
            queryset = queryset[:limit]
        return queryset


@api_view(['GET'])
def categories_list(request):
    cats = ExternalCategory.objects.using('import-tool').all()
    cats = ExternalCategorySerializer(cats, many=True).data
    return Response(cats)


@api_view(['GET'])
def genres_list(request):
    genres = ExternalGenre.objects.using('import-tool').all()
    genres = ExternalGenreSerializer(genres, many=True).data
    return Response(genres)


@api_view(['GET'])
def get_songs_count_for_playlists(request):
    ids = request.query_params.get('ids', [])
    ids = ids.split(',')
    result = {}
    playlist = None
    count = None
    for playlist_id in ids:
        playlist = Playlist.objects.get(pk=playlist_id)
        count = PlaylistQueueExecutor.fetch_songs_count_for_playlist(playlist)
        result[playlist.id] = count
    return Response(result)
