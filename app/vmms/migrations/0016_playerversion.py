# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2017-01-30 09:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vmms', '0015_remove_user_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlayerVersion',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version_string', models.CharField(max_length=64, verbose_name='Version string')),
                ('link', models.CharField(max_length=512, verbose_name='Link')),
                ('created_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
