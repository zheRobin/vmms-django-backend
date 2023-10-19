from rest_framework import serializers

from vmms.models import Client, Category, Genre, \
                    ExternalGenre, User, Event, Content, \
                    PlayerVersion, ClientContent, ClientFilter
from vmms.utils import generate_api_key
from .playlist import PlaylistSerializer
from .program import ProgramSerializer


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = '__all__'

    def to_representation(self, value):
        if value.program is not None:
            return {
                'id': value.id,
                'type': 'program',
                'object': ProgramSerializer(value.program).data
            }
        elif value.playlist is not None:
            return {
                'id': value.id,
                'type': 'playlist',
                'object': PlaylistSerializer(value.playlist).data
            }

    def to_internal_value(self, data):
        bc = None
        if data['type'] == 'program':
            bc = Content(program_id=data['object']['id'])
        elif data['type'] == 'playlist':
            bc = Content(playlist_id=data['object']['id'])
        bc.save()
        return bc
