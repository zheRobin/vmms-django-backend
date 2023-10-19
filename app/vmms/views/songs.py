from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

from vmms.models import ExternalSong
from vmms.permissions import IsMusicUser
from vmms.serializers import ExternalSongSerializer


@permission_classes((IsAuthenticated, IsMusicUser))
class SongViewSet(viewsets.ModelViewSet):
    serializer_class = ExternalSongSerializer

    def get_queryset(self):
        DEFAULT_LIMIT = 100
        SEARCH_FIELDS = ['title', 'artist']
        COMPARATORS = ['', '__icontains']
        query = self.request.query_params.get('query', None)
        queryset = ExternalSong.objects.using('import-tool').all()
        if query is not None:
            philter = None
            for field in SEARCH_FIELDS:
                for comparator in COMPARATORS:
                    new_philter = Q(**{field + comparator: query})
                    if philter is None:
                        philter = new_philter
                    else:
                        philter |= new_philter
            queryset = queryset.filter(philter)

        queryset = queryset.filter(status=1)

        limit = self.request.query_params.get('limit', DEFAULT_LIMIT)
        if limit is not None:
            limit = int(limit)
            queryset = queryset[:limit]
        return queryset

