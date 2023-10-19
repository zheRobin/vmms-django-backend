from datetime import datetime, timedelta
from rest_framework import serializers
from vmms.serializers.playlist import PlaylistSerializer
from vmms.models import ProgramFolder, Program, ProgramPlaylist, ProgramPreviewLink
from vmms.utils import get_program_prefix, generate_secret_login_key


class ProgramFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramFolder
        fields = '__all__'


class ProgramPlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramPlaylist
        fields = '__all__'
        read_only_fields = ('program',)
        extra_kwargs = {'program': {'required': False, }}   


class ProgramShallowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ('id', 'name', 'parent', 'prefix', 'playlists',)

    playlists = ProgramPlaylistSerializer(many=True)
    prefix = serializers.SerializerMethodField()

    def get_prefix(self, obj):
        return get_program_prefix(obj)


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

    playlists = ProgramPlaylistSerializer(many=True)
    prefix = serializers.SerializerMethodField()

    def get_prefix(self, obj):
        return get_program_prefix(obj)

    def create(self, validated_data):
        playlists = validated_data.pop('playlists')

        program = Program.objects.create(**validated_data)
        program.save()

        for p in playlists:
            pp = ProgramPlaylist.objects.create(program=program, **p)
            pp.save()

        return program

    def update(self, instance, validated_data):
        playlists = validated_data.pop('playlists')

        instance = super(ProgramSerializer, self).update(instance, validated_data)
        ProgramPlaylist.objects.filter(program=instance).delete()
        for p in playlists:
            pp = ProgramPlaylist.objects.create(program=instance, **p)
            pp.save()
        return instance


class IdedProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

    id = serializers.ModelField(model_field=Program()._meta.get_field('id'))
    playlists = ProgramPlaylistSerializer(many=True)
    prefix = serializers.SerializerMethodField()

    def get_prefix(self, obj):
        return get_program_prefix(obj)

    def create(self, validated_data):
        playlists = validated_data.pop('playlists')

        program = Program.objects.create(**validated_data)
        program.save()

        for p in playlists:
            pp = ProgramPlaylist.objects.create(program=program, **p)
            pp.save()

        return program

    def update(self, instance, validated_data):
        playlists = validated_data.pop('playlists')

        instance = super(ProgramSerializer, self).update(instance, validated_data)
        ProgramPlaylist.objects.filter(program=instance).delete()
        for p in playlists:
            pp = ProgramPlaylist.objects.create(program=instance, **p)
            pp.save()
        return instance


class ProgramPreviewLinkCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramPreviewLink
        fields = '__all__'
        extra_kwargs = {
            'key': {'required': False, 'read_only': True,},
        }


class ProgramPreviewLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramPreviewLink
        fields = '__all__'
        extra_kwargs = {
            'key': {'required': False, 'read_only': True,},
        }

    program = IdedProgramSerializer()
