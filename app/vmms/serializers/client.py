import requests
from rest_framework import serializers
from vmms.models import Client, ClientFolder, Category, Genre, \
                    ExternalGenre, User, Event, Content, \
                    PlayerVersion, ClientContent, ClientFilter, \
                    ClientPromotion, Promotion, ClientContentRequest, \
                    ClientVolumeRequest, ClientGroup
from vmms.utils import generate_api_key, generate_secret_login_key
from .content import ContentSerializer


class ClientFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientFolder
        fields = '__all__'


class ClientContentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientContentRequest
        fields = '__all__'


class ClientVolumeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientVolumeRequest
        fields = '__all__'


class ClientContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientContent
        fields = '__all__'
        extra_kwargs = {'client': {'required': False,}}

    content = ContentSerializer()


class ClientPromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientPromotion
        fields = '__all__'
        extra_kwargs = {'client': {'required': False,}}

    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        try:
            return Promotion.objects.using('promotion-tool').get(pk=obj.promotion_id).name
        except Exception as e:
            return "* INVALID PROMOTION *"


class ClientFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientFilter
        fields = '__all__'
        extra_kwargs = {'client': {'required': False,}}


class ClientSecretClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'name', 'api_key', 'basic_content', 'contents', 'volume_request',
                  'remote_volume_control_enabled')

    basic_content = ContentSerializer()
    contents = ClientContentSerializer(many=True)
    volume_request = serializers.SerializerMethodField()

    def get_volume_request(self, obj):
        volume_request = None
        if obj.volume_requests.all().count() > 0:
            volume_request = obj.volume_requests.order_by('-time')[0]
            volume_request = {
                'id': volume_request.id,
                'time': volume_request.time,
                'volume': volume_request.volume
            }
        return volume_request


class ClientShallowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'name', 'parent', 'master_schedule_enabled')

    id = serializers.IntegerField(read_only=False)


class ClientShallowWithFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'name', 'parent', 'master_schedule_enabled')

    id = serializers.IntegerField(read_only=False)
    parent = ClientFolderSerializer()


class ClientGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientGroup
        fields = '__all__'

    clients = ClientShallowWithFolderSerializer(many=True)

    def create(self, validated_data):
        clients = validated_data.pop('clients')
        db_clients = []
        for client in clients:
            db_clients.append(Client.objects.get(pk=client['id']))
        group = ClientGroup.objects.create(**validated_data)
        group.save()
        group.clients.add(*db_clients)
        group.save()
        return group

    def update(self, instance, validated_data):
        clients = validated_data.pop('clients')
        instance = super(ClientGroupSerializer, self).update(instance, validated_data)
        instance.clients.clear()
        db_clients = []
        for client in clients:
            db_clients.append(Client.objects.get(pk=client['id']))
        instance.clients.add(*db_clients)
        instance.save()
        return instance


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('api_key', 'secret_login_key')

    basic_content = ContentSerializer()
    contents = ClientContentSerializer(many=True)
    filters = ClientFilterSerializer(many=True, required=False)
    promotions = ClientPromotionSerializer(many=True, required=False)

    def create(self, validated_data):
        validated_data['api_key'] = generate_api_key()
        validated_data['secret_login_key'] = generate_secret_login_key()

        contents = validated_data.pop('contents')
        filters = validated_data.pop('filters', None)
        promotions = validated_data.pop('promotions', None)

        client = Client.objects.create(**validated_data)
        client.save()

        for content in contents:
            if 'client' in content:
                content.pop('client')
            c = ClientContent.objects.create(client=client, **content)
            c.save()

        if filters:
            for f in filters:
                if 'client' in f:
                    f.pop('client')
                cf = ClientFilter.objects.create(client=client, **f)
                cf.save()

        if promotions:
            for promotion in promotions:
                if 'client' in promotion:
                    promotion.pop('client')
                p = ClientPromotion.objects.create(client=client, **promotion)
                p.save()

        r = requests.post(
            'https://monitoring.vmms.network/api/v1/hooks/player-created',
            data={
                'name': client.name,
                'api_key': client.api_key
            }
        )
        print(r.status_code)
        print(r.text)
        print('Pushed')

        return client

    def update(self, instance, validated_data):
        contents = validated_data.pop('contents')
        filters = validated_data.pop('filters', None)
        promotions = validated_data.pop('promotions', None)

        instance = super(ClientSerializer, self).update(instance, validated_data)

        ClientContent.objects.filter(client=instance).delete()
        ClientFilter.objects.filter(client=instance).delete()
        ClientPromotion.objects.filter(client=instance).delete()

        for content in contents:
            if 'client' in content:
                content.pop('client')
            cc = ClientContent.objects.create(client=instance, **content)
            cc.save()

        if filters:
            for f in filters:
                if 'client' in f:
                    f.pop('client')
                cf = ClientFilter.objects.create(client=instance, **f)
                cf.save()

        if promotions:
            for promotion in promotions:
                if 'client' in promotion:
                    promotion.pop('client')
                p = ClientPromotion.objects.create(client=instance, **promotion)
                p.save()

        return instance
