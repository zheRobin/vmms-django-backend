from rest_framework import serializers

from vmms.models import Client, Category, Genre, \
                    ExternalGenre, ExternalCategory, User, Event, Content, \
                    PlayerVersion, ClientContent, ClientFilter, GroupEvent
from vmms.utils import generate_api_key
from .client import *
from .content import ContentSerializer
from .playlist import *
from .program import *
from .promotion import *
from .songs import ExternalSongSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'


class ExternalCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalCategory
        fields = '__all__'


class ExternalGenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalGenre
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'required': False, 'write_only': True},
            'host': {'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['host'] = self.context['request'].referer_host
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = None
        if 'password' in validated_data:
            password = validated_data.pop('password')
        instance = super(UserSerializer, self).update(instance, validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

    content = ContentSerializer()


class GroupEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupEvent
        fields = '__all__'

    content = ContentSerializer()


class PlayerVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerVersion
        fields = '__all__'

    def create(self, validated_data):
        pv = PlayerVersion(**validated_data)
        if pv.current:
            PlayerVersion.objects.all().update(current=False)
        pv.save()
        return pv

    def update(self, instance, validated_data):
        instance = super(PlayerVersionSerializer, self).update(instance, validated_data)
        if instance.current:
            PlayerVersion.objects.all().update(current=False)
        instance.save()
        return instance
