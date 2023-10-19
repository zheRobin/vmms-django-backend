from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from vmms.serializers import UserSerializer
from vmms.permissions import WhitelistedRefererRequired


@api_view(['POST'])
@permission_classes((WhitelistedRefererRequired,))
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    host = request.referer_host
    if username is not None and password is not None and host is not None:
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.host == host:
                login(request, user)
                return Response(
                        UserSerializer(
                            request.user
                        ).data
                    )
            else:
                return Response(
                    {'status': 'error', 'msg': 'Login/password combination not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                    {'status': 'error', 'msg': 'Login/password combination not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    else:
        return Response(
            {'status': 'error', 'msg': 'Empty login or password.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes((WhitelistedRefererRequired,))
def obtain_token_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    host = request.referer_host
    if username is not None and password is not None and host is not None:
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.host == host:
                if Token.objects.filter(user=user).exists():
                    token = Token.objects.get(user=user)
                else:
                    token = Token.objects.create(user=user)
                return Response(
                    {
                        'token': token.key,
                        'user': UserSerializer(
                            user
                        ).data
                    }
                )
            else:
                return Response(
                    {'status': 'error', 'msg': 'Login/password combination not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                    {'status': 'error', 'msg': 'Login/password combination not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    else:
        return Response(
            {'status': 'error', 'msg': 'Empty login or password.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
def profile_view(request):
    if request.referer_host == request.user.host:
        return Response(
            UserSerializer(
                request.user
            ).data
        )
    else:
        return Response({ "status": "error", "msg": "You're not signed in." })


@api_view(['GET'])
def logout_view(request):
    logout(request)
    return Response({"status": "ok"})
