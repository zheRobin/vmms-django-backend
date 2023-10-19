from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from vmms.models import PlayerVersion


@api_view(['GET'])
@permission_classes(tuple())
def get_latest_version(request):
    v = request.query_params.get('v')
    current = PlayerVersion.objects.get(current=True)
    if current.version_string != v:
        result = {
            'should_update': True,
            'version': current.version_string,
            'link': current.link,
        }
    else:
        result = {
            'should_update': False,
        }
    return Response(result)
