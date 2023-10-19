import json
import requests
from copy import deepcopy
from datetime import datetime, timedelta
from django.db.models import Count
from django.views.generic import TemplateView
from rest_framework import mixins, viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from vmms.permissions import IsMusicUser, IsManagementUser
from vmms.serializers import ClientSerializer, UserSerializer, EventSerializer, \
                             PlayerVersionSerializer, ClientFolderSerializer, \
                             ClientSecretClientSerializer, ClientShallowSerializer, \
                             ClientContentRequestSerializer, ClientGroupSerializer, \
                             GroupEventSerializer, ClientShallowWithFolderSerializer, \
                             ClientVolumeRequestSerializer
from vmms.models import Client, Category, Genre, User, Event, \
                        PlayerVersion, ClientFolder, ClientContentRequest, \
                        ClientGroup, GroupEvent, ClientVolumeRequest
from vmms.utils import generate_api_key, generate_secret_login_key
from vmms.permissions import IsNotUser, WhitelistedRefererRequired

from vmms.playlists import get_filter_data

from .auth import login_view, logout_view, profile_view, obtain_token_view
from .playlist import PlaylistViewSet, PlaylistFolderViewSet, ExternalTagViewSet, playlist_preview, \
                      categories_list, genres_list, playlist_dependents, get_songs_count_for_playlists
from .program import ProgramFolderViewSet, ProgramViewSet, ProgramPreviewLinkViewSet, program_dependents, \
                     program_preview, program_preview_link, get_songs_count_for_programs
from .promotion import PromotionViewSet
from .s3 import sign_upload_request
from .schedule import get_schedule, get_schedule_for_period, get_group_schedule_for_period
from .songs import SongViewSet
from .versions import get_latest_version
from .v2 import *
from .v3 import *
from .v4 import *
from .v5 import *
from .v6 import *
from .sync import *


class IndexView(TemplateView):
    template_name = 'you_shall_not_pass.html'


@api_view(['GET'])
@permission_classes((IsAuthenticated,))
def filter_data_view(request):
    return Response(get_filter_data())


@api_view(['GET'])
@permission_classes(tuple())
def get_client_secret(request, secret):
    try:
        client = Client.objects.get(secret_login_key=secret)
        return Response(
            ClientSecretClientSerializer(
                client
            ).data
        )
    except Exception as e:
        return Response(
                {'status': 'error', 'msg': 'Login/password combination not found.'},
                status=status.HTTP_403_FORBIDDEN
            )


@permission_classes((IsAuthenticated, IsManagementUser, ))
class ClientGroupViewSet(viewsets.ModelViewSet):
    serializer_class = ClientGroupSerializer
    queryset = ClientGroup.objects.all()


@permission_classes((IsAuthenticated, IsManagementUser))
class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer

    def get_queryset(self):
        SEARCH_FIELDS = ['name']
        query = self.request.query_params.get('query', None)
        only_clients_with_content = self.request.query_params.get('onlyClientsWithContent', None)
        queryset = Client.objects.exclude(id=-1)
        if query is not None:
            philter = None
            for field in SEARCH_FIELDS:
                new_philter = Q(**{field + '__icontains': query})
                if philter is None:
                    philter = new_philter
                else:
                    philter |= new_philter
            queryset = queryset.filter(philter)
        if only_clients_with_content == 'true':
            queryset = queryset.annotate(num_content=Count('contents')).filter(num_content__gt=0)

        limit = self.request.query_params.get('limit', None)
        if limit is not None:
            limit = int(limit)
            queryset = queryset[:limit]
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            if 'includeFolder' in self.request.query_params:
                return ClientShallowWithFolderSerializer
            else:
                return ClientShallowSerializer
        return ClientSerializer


@permission_classes((IsAuthenticated, IsManagementUser))
class ClientFolderViewSet(viewsets.ModelViewSet):
    queryset = ClientFolder.objects.all()
    serializer_class = ClientFolderSerializer


@permission_classes((IsNotUser, WhitelistedRefererRequired))
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(host=self.request.referer_host)

    def get_serializer_context(self):
        return {'request': self.request}


@permission_classes((IsAuthenticated, IsManagementUser))
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


@permission_classes((IsAuthenticated, IsManagementUser))
class GroupEventViewSet(viewsets.ModelViewSet):
    queryset = GroupEvent.objects.all()
    serializer_class = GroupEventSerializer


@permission_classes((IsAuthenticated, IsManagementUser))
class ClientScheduledEventsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        client_id = self.kwargs.get('id')
        client = Client.objects.get(pk=client_id)
        return client.events


@permission_classes((IsAuthenticated, IsManagementUser, IsNotUser))
class PlayerVersionViewSet(viewsets.ModelViewSet):
    queryset = PlayerVersion.objects.all()
    serializer_class = PlayerVersionSerializer


@permission_classes(tuple())
class ClientContentRequestViewSet(viewsets.ModelViewSet):
    queryset = ClientContentRequest.objects.all()
    serializer_class = ClientContentRequestSerializer


@permission_classes(tuple())
class ClientVolumeRequestViewSet(viewsets.ModelViewSet):
    queryset = ClientVolumeRequest.objects.all()
    serializer_class = ClientVolumeRequestSerializer


@api_view(['PUT'])
@permission_classes((IsAuthenticated, IsManagementUser, IsNotUser))
def reset_api_key(request, id):
    client = Client.objects.get(pk=id)
    client.api_key = generate_api_key()
    client.save()

    requests.post(
        'https://monitoring.vmms.network/api/v1/hooks/player-api-key-updated',
        data={
            'name': client.name,
            'api_key': client.api_key
        }
    )

    return Response(
        ClientSerializer(
            client
        ).data
    )


@api_view(['POST'])
@permission_classes((IsAuthenticated, IsManagementUser, IsNotUser))
def copy_client(request, id):
    COPIED_SUFFIX = ' - copy'

    with_events = request.query_params.get('with_events', None)
    if with_events is not None:
        with_events = with_events == 'true'
    else:
        with_events = False

    client = Client.objects.get(pk=id)
    client_pk = client.pk
    client.pk = None
    client.api_key = generate_api_key()
    client.secret_login_key = generate_secret_login_key()
    client.name = client.name + COPIED_SUFFIX
    client.save()

    if with_events:
        events =Event.objects.filter(client_id=client_pk)
        for event in events:
            event.pk = None
            event.client = client
            event.save()

    return Response(
        ClientSerializer(
            client
        ).data
    )


@api_view(['PUT'])
@permission_classes((IsAuthenticated, IsManagementUser, IsNotUser))
def reset_login_key(request, id):
    client = Client.objects.get(pk=id)
    client.secret_login_key = generate_secret_login_key()
    client.save()
    return Response(
        ClientSerializer(
            client
        ).data
    )


@api_view(['PUT'])
@permission_classes((IsAuthenticated, IsManagementUser))
def client_master_schedule_toggle(request, client_id):
    client = Client.objects.get(pk=client_id)
    client.master_schedule_enabled = request.query_params['master-schedule'] == 'true'
    client.save()
    return Response(
        ClientSerializer(
            client
        ).data
    )


@api_view(['PUT'])
@permission_classes((IsAuthenticated, IsManagementUser))
def client_master_schedule_toggle_all(request):
    new_enabled = request.query_params['master-schedule'] == 'true'
    for client in Client.objects.all():
        client.master_schedule_enabled = new_enabled
        client.save()
    return Response({
        'success': True
    })
