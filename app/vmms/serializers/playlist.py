from rest_framework import serializers
from vmms.models import PlaylistFolder, PlaylistFilter, PlaylistSong, Playlist, ExternalSong, ExternalTag
from vmms.utils import get_playlist_prefix
from .songs import ExternalSongSerializer


class ExternalTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalTag
        fields = '__all__'


class PlaylistFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistFolder
        fields = '__all__'


class PlaylistSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistSong
        fields = '__all__'
        extra_kwargs = {'playlist': {'required': False, },}

    song = ExternalSongSerializer()


class PlaylistFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistFilter
        fields = '__all__'
        read_only_fields = ('playlist',)
        extra_kwargs = {'playlist': {'required': False, },}


class PlaylistShallowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ('id', 'name', 'parent', 'prefix')

    prefix = serializers.SerializerMethodField()

    def get_prefix(self, obj):
        return get_playlist_prefix(obj)


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = '__all__'

    filters = PlaylistFilterSerializer(many=True)
    songs = PlaylistSongSerializer(many=True)
    prefix = serializers.SerializerMethodField()

    def get_prefix(self, obj):
        return get_playlist_prefix(obj)

    def create(self, validated_data):
        filters = validated_data.pop('filters')
        songs = validated_data.pop('songs')

        playlist = Playlist.objects.create(**validated_data)
        playlist.save()

        for f in filters:
            pf = PlaylistFilter.objects.create(playlist=playlist, **f)
            pf.save()

        for s in songs:
            print(s)
            if not ExternalSong.objects.filter(pk=s['song']['id']).exists():
                es = ExternalSong.objects.create(**s['song'])
                es.save()
            else:
                es = ExternalSong.objects.get(pk=s['song']['id'])
            ps = PlaylistSong.objects.create(playlist=playlist, song=es)
            ps.save()

        return playlist

    def update(self, instance, validated_data):
        filters = validated_data.pop('filters')
        songs = validated_data.pop('songs')

        instance = super(PlaylistSerializer, self).update(instance, validated_data)
        PlaylistFilter.objects.filter(playlist=instance).delete()
        PlaylistSong.objects.filter(playlist=instance).delete()

        for f in filters:
            pf = PlaylistFilter.objects.create(playlist=instance, **f)
            pf.save()

        print(songs)
        for s in songs:
            ees = ExternalSong.objects.using('import-tool').get(pk=s['song']['id'])
            # ees = ExternalSong.objects.using('import-tool').get(artist=s['song']['artist'], title=s['song']['title'])
            print('id is', ees.id)
            if not ExternalSong.objects.filter(pk=ees.id).exists():
                print('doesnt exist')
                es = ExternalSong.objects.create(**s['song'])
                es.save()
                print(es.pk)
                print('saved!')
            else:
                print('exists')
                es = ExternalSong.objects.get(pk=ees.id)
            print(es.artist, es.title)
            ps = PlaylistSong.objects.create(playlist=instance, song=es)
            ps.save()
        
        return instance
