from rest_framework import serializers
from vmms.models import ExternalSong


class ExternalSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalSong
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': False},
        }
