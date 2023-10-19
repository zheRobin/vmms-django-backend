from django.db import models


class ExternalCategory(models.Model):
    name = models.CharField('Category name', max_length=128)
    order = models.IntegerField()

    class Meta:
        db_table = 'categories'


class ExternalGenre(models.Model):
    class Meta:
        db_table = 'genres'

    name = models.CharField('Genre name', max_length=128)
    category = models.ForeignKey('ExternalCategory', on_delete=models.CASCADE)
    order = models.IntegerField()


class ExternalSong(models.Model):
    class Meta:
        db_table = 'songs'

    id = models.AutoField(primary_key=True)
    title = models.CharField('Title', max_length=191)
    artist = models.CharField('Artist', max_length=191)
    status = models.IntegerField()


class ExternalTag(models.Model):
    class Meta:
        db_table = 'songs_tags'

    name = models.CharField('Tag name', max_length=191)


class LastUpdatedAt(models.Model):
    class Meta:
        db_table = 'last_updated_at'

    table_name = models.CharField(max_length=45)
    last_updated_at = models.DateTimeField()
