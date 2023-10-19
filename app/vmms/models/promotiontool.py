from django.db import models


class Promotion(models.Model):
    class Meta:
        db_table = 'promotions'
        managed = False

    name = models.CharField('Promotion name', max_length=191)


class PromotionFull(models.Model):
    class Meta:
        db_table = 'promotions'
        managed = False

    name = models.CharField(max_length=191)
    playback = models.SmallIntegerField()
    level_reduction = models.SmallIntegerField()
    play_between_songs = models.BooleanField()
    start_date = models.DateField()
    end_date = models.DateField()


class Schedule(models.Model):
    class Meta:
        db_table = 'schedules'
        managed = False

    promotion = models.ForeignKey('PromotionFull', primary_key=True, db_column='promotion_id',
                                  related_name='schedule', on_delete=models.CASCADE)
    monday = models.BooleanField()
    tuesday = models.BooleanField()
    wednesday = models.BooleanField()
    thursday = models.BooleanField()
    friday = models.BooleanField()
    saturday = models.BooleanField()
    sunday = models.BooleanField()


class ScheduleTimes(models.Model):
    class Meta:
        db_table = 'schedule_times'
        managed = False

    promotion = models.ForeignKey('PromotionFull', primary_key=True, db_column='promotion_id',
                                  related_name='schedule_times', on_delete=models.CASCADE)
    time = models.TimeField()
    variance = models.SmallIntegerField()


class Track(models.Model):
    class Meta:
        db_table = 'tracks'
        managed = False

    promotion = models.ForeignKey('PromotionFull', db_column='promotion_id',
                                  related_name='tracks', on_delete=models.CASCADE)
    name = models.CharField(max_length=191)
    order = models.IntegerField()
    hash = models.CharField(max_length=36)
    duration = models.IntegerField()
