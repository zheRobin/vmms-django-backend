import requests
from vmms.models import Client, ClientFolder
from vmms.serializers import ClientSerializer, ClientFolderSerializer
from vmms.settings import PROD
import json


def sync_clients_and_folders():
    client_serializer = ClientSerializer(Client.objects.exclude(id=-1), many=True)
    client_folder_serializer = ClientFolderSerializer(ClientFolder.objects.all(), many=True)
    if PROD:
        url = 'https://monitoring.vmms.network/api/v1/hooks/sync-clients'
    else:
        url = 'http://monitoring.vmms.local:8080/api/v1/hooks/sync-clients'
    r = requests.post(
        url,
        json=json.dumps({
            'clients': client_serializer.data,
            'folders': client_folder_serializer.data
        })
    )
