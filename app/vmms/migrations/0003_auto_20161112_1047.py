# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-11-12 10:47
from __future__ import unicode_literals

from django.db import migrations, models
import csv


SOURCE_FILENAME = 'data/genres.csv'

def forward_func(apps, schema_editor):
    # This migration is not used because
    # genres and categories are read from
    # another database
    return
    """
    categories = {}
    with open(SOURCE_FILENAME, 'rb') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            category = row[0]
            genre = row[1]
            if categories.get(category, None) is None:
                categories[category] = []
            categories[category].append(genre)
    Category = apps.get_model('vmms', 'Category')
    Genre = apps.get_model('vmms', 'Genre')
    for category, genres in categories.items():
        cat = Category(name=category)
        cat.save()
        for genre in genres:
            genre_pers = Genre(name=genre, parent=cat)
            genre_pers.save()
    """

class Migration(migrations.Migration):

    dependencies = [
        ('vmms', '0002_category_genre'),
    ]

    operations = [
        migrations.RunPython(forward_func)
    ]
