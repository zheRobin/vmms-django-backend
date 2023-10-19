from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from vmms.sync import sync_clients_and_folders


@api_view(['GET'])
def sync_manual(request):
    sync_clients_and_folders()
    return Response({'msg': 'Request sent to monitoring.'})
