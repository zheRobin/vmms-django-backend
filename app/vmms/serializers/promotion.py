from rest_framework import serializers
from vmms.models import Promotion, PromotionFull, Schedule, ScheduleTimes, Track


class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'


class ScheduleTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleTimes
        fields = '__all__'


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'


class PromotionFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionFull
        fields = '__all__'

    schedule = ScheduleSerializer(many=True)
    schedule_times = ScheduleTimeSerializer(many=True)
    tracks = TrackSerializer(many=True)
