# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-05-25 15:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vmms', '0043_programpreviewlink_promotionfull_schedule_scheduletimes_track'),
    ]

    operations = [
        migrations.AlterField(
            model_name='programpreviewlink',
            name='name',
            field=models.CharField(max_length=128, unique=True, verbose_name='Link name'),
        ),
    ]
