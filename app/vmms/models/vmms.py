"""Module containing all the project models."""
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import AbstractUser
from django.db import models


USER_GROUPS = (
    ('Superuser', 'Superuser',),
    ('Admin', 'Admin',),
    ('User', 'User',),
)

EVENT_REPEAT_MODES = (
    ('NO', 'Not repeating'),
    ('DAY', 'Daily'),
    ('WEEK', 'Weekly'),
    ('MONTH', 'Monthly')
)

PLAYLIST_CONTENT_MODES = {
    'FILTERS_AND_GENRES': 0,
    'MANUAL': 1
}


class CachedPlaylist(models.Model):
    playlist_id = models.IntegerField()
    client_id = models.IntegerField()
    songs = models.TextField()
    created_at = models.DateTimeField(auto_now=True)


class ClientFolder(models.Model):
    """Client folder."""

    name = models.CharField('Folder name', max_length=128)
    parent = models.ForeignKey('ClientFolder', on_delete=models.PROTECT, null=True)


class ClientGroup(models.Model):
    name = models.CharField('Client group name', max_length=128)
    clients = models.ManyToManyField('Client')


class Client(models.Model):
    """Client representation."""

    name = models.CharField('Client name', max_length=64)
    api_key = models.CharField('API key', max_length=64)
    secret_login_key = models.CharField('Secret login key', max_length=64)
    parent = models.ForeignKey('ClientFolder', related_name='clients', on_delete=models.CASCADE)
    basic_content = models.ForeignKey('Content', null=True, on_delete=models.PROTECT)
    master_schedule_enabled = models.BooleanField('Is master schedule enabled for client?', default=False)
    remote_volume_control_enabled = models.BooleanField('Is remote volume control enabled for client?', default=False)

    # Opening hours
    #   Monday
    monday_enabled = models.BooleanField('Is client working', default=False)
    monday_open = models.TimeField('Opening time', null=True, default=None)
    monday_close = models.TimeField('Closing time', null=True, default=None)
    #  Tuesday
    tuesday_enabled = models.BooleanField('Is client working', default=False)
    tuesday_open = models.TimeField('Opening time', null=True, default=None)
    tuesday_close = models.TimeField('Closing time', null=True, default=None)
    #  Wednesday
    wednesday_enabled = models.BooleanField('Is client working', default=False)
    wednesday_open = models.TimeField('Opening time', null=True, default=None)
    wednesday_close = models.TimeField('Closing time', null=True, default=None)
    #  Thursday
    thursday_enabled = models.BooleanField('Is client working', default=False)
    thursday_open = models.TimeField('Opening time', null=True, default=None)
    thursday_close = models.TimeField('Closing time', null=True, default=None)
    #  Friday
    friday_enabled = models.BooleanField('Is client working', default=False)
    friday_open = models.TimeField('Opening time', null=True, default=None)
    friday_close = models.TimeField('Closing time', null=True, default=None)
    #  Saturday
    saturday_enabled = models.BooleanField('Is client working', default=False)
    saturday_open = models.TimeField('Opening time', null=True, default=None)
    saturday_close = models.TimeField('Closing time', null=True, default=None)
    #  Sunday
    sunday_enabled = models.BooleanField('Is client working', default=False)
    sunday_open = models.TimeField('Opening time', null=True, default=None)
    sunday_close = models.TimeField('Closing time', null=True, default=None)


class ClientPromotion(models.Model):
    """ """

    client = models.ForeignKey('Client', related_name='promotions', on_delete=models.CASCADE)
    promotion_id = models.IntegerField('Promotion ID')


class ClientContent(models.Model):
    """Client-content relationship.
    Entity that represents relationship between
    Client and Content entities, which is used for
    client-specific programs."""
    client = models.ForeignKey('Client', related_name='contents', on_delete=models.CASCADE)
    content = models.ForeignKey('Content', on_delete=models.CASCADE)


class ClientContentRequest(models.Model):
    time = models.DateTimeField('Time the request has been added', auto_now=True)
    client = models.ForeignKey('Client', related_name='content_requests', on_delete=models.CASCADE)
    content = models.ForeignKey('Content', related_name='requests', on_delete=models.CASCADE)


class ClientVolumeRequest(models.Model):
    id = models.BigAutoField(primary_key=True)
    time = models.DateTimeField('Time the request has been added', auto_now=True)
    client = models.ForeignKey('Client', related_name='volume_requests', on_delete=models.CASCADE)
    volume = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ]
    )


class Category(models.Model):
    """Genre category."""

    name = models.CharField('Category name', max_length=128)


class Genre(models.Model):
    """Genre per se."""

    name = models.CharField('Genre name', max_length=128)
    parent = models.ForeignKey('Category', related_name='genres', on_delete=models.CASCADE)


class PlaylistFolder(models.Model):
    """Playlist folder."""

    name = models.CharField('Folder name', max_length=128)
    parent = models.ForeignKey('PlaylistFolder', on_delete=models.PROTECT, null=True)


class PlaylistFilter(models.Model):
    """Playlist filter."""

    field = models.CharField('Filter field', max_length=128)
    word = models.CharField('Filter word', max_length=32)
    value = models.CharField('Filter value', max_length=256)
    playlist = models.ForeignKey('Playlist', related_name='filters', on_delete=models.CASCADE)


class ClientFilter(models.Model):
    """Client filter."""

    field = models.CharField('Filter field', max_length=128)
    word = models.CharField('Filter word', max_length=32)
    value = models.CharField('Filter value', max_length=256)
    client = models.ForeignKey('Client', related_name='filters', on_delete=models.CASCADE)


class Playlist(models.Model):
    """Playlist."""

    name = models.CharField('Playlist name', max_length=128)
    parent = models.ForeignKey('PlaylistFolder', related_name='playlists', on_delete=models.CASCADE)
    genres = models.TextField('Genre IDs', blank=True)
    include_tags = models.TextField('Include tag IDs', blank=True)
    exclude_tags = models.TextField('Exclude tag IDs', blank=True)
    cover = models.CharField('Playlist cover', null=True, max_length=1024)
    color = models.CharField('Color', max_length=7)
    content_mode = models.IntegerField('Content mode', default=PLAYLIST_CONTENT_MODES['FILTERS_AND_GENRES'])
    notes = models.TextField('Playlist notes', null=True, blank=True)


class PlaylistSong(models.Model):
    playlist = models.ForeignKey('Playlist', related_name='songs', on_delete=models.CASCADE)
    song = models.ForeignKey('ExternalSong', on_delete=models.CASCADE)


class ProgramFolder(models.Model):
    """Program folder for hierarchy."""

    name = models.CharField('Folder name', max_length=256)
    parent = models.ForeignKey('ProgramFolder', on_delete=models.PROTECT, null=True)


class Program(models.Model):
    """Program model.
    Program is an entity that contains of playlists and their
    percentages in it that can also be selected as event content.
    """

    name = models.CharField('Program name', max_length=256)
    parent = models.ForeignKey('ProgramFolder', related_name='programs', on_delete=models.CASCADE)
    cover = models.CharField('Program cover', null=True, max_length=1024)
    color = models.CharField('Color', max_length=7)
    notes = models.TextField('Playlist notes', null=True, blank=True)


class ProgramPlaylist(models.Model):
    """Program-Playlist relation entity.
    Program playlist contains the information about a playlist
    that is included into the program and it's share of the
    program in percents.
    """

    program = models.ForeignKey('Program', related_name='playlists', on_delete=models.CASCADE)
    playlist = models.ForeignKey('Playlist', on_delete=models.CASCADE)
    percentage = models.IntegerField('Playlist percentage in the program')


class User(AbstractUser):
    """System user."""

    group = models.CharField('User group', max_length=256, choices=USER_GROUPS)
    host = models.CharField('Website hostname where the user is active', max_length=512)


class Event(models.Model):
    """Client event."""

    name = models.CharField('Event name', max_length=128)
    start = models.DateTimeField('Start time')
    end = models.DateTimeField('End time')
    repeating = models.CharField('Repeating mode', max_length=6, choices=EVENT_REPEAT_MODES)
    repeat_every_n = models.IntegerField('Repeat every N weeks', null=True, blank=True)
    repeating_end = models.DateTimeField('Repeating end date', null=True, blank=True)
    high_priority = models.BooleanField('Is this a high priority event?', default=False)
    content = models.ForeignKey('Content', on_delete=models.CASCADE)
    client = models.ForeignKey('Client', related_name='events', on_delete=models.CASCADE)
    last_modified = models.DateTimeField('Last modified date', auto_now=True)


class GroupEvent(models.Model):
    """Group event."""

    name = models.CharField('Event name', max_length=128)
    start = models.DateTimeField('Start time')
    end = models.DateTimeField('End time')
    repeating = models.CharField('Repeating mode', max_length=6, choices=EVENT_REPEAT_MODES)
    repeat_every_n = models.IntegerField('Repeat every N weeks', null=True, blank=True)
    repeating_end = models.DateTimeField('Repeating end date', null=True, blank=True)
    high_priority = models.BooleanField('Is this a high priority event?', default=False)
    content = models.ForeignKey('Content', on_delete=models.CASCADE)
    group = models.ForeignKey('ClientGroup', related_name='events', on_delete=models.CASCADE)
    last_modified = models.DateTimeField('Last modified date', auto_now=True)


class Content(models.Model):
    """Content entity.
    This entity is a container for either playlist or a program. Only one of two
    fields should be not null at a time. This entity is used as a basic content
    for client and in the events.
    """

    program = models.ForeignKey('Program', null=True, on_delete=models.CASCADE)
    playlist = models.ForeignKey('Playlist', null=True, on_delete=models.CASCADE)


class PlayerVersion(models.Model):
    """Player version.
    Player version is an entity that describes a player version. It contains
    version string, a link to download it and the date it has been created at.
    Date is used for easier extraction of the latest version from the database.
    """

    version_string = models.CharField('Version string', max_length=64)
    current = models.BooleanField('Is this version current?', default=False)
    link = models.CharField('Link', max_length=512)
    created_at = models.DateTimeField(auto_now=True)


class ProgramPreviewLink(models.Model):
    name = models.CharField('Link name', max_length=128, unique=True)
    key = models.CharField('Secret key', max_length=64)
    program = models.ForeignKey('Program', on_delete=models.CASCADE)
    expiration_date = models.DateTimeField()
