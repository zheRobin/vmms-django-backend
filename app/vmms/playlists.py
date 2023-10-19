import pytz
from datetime import datetime, timedelta
from dateutil.parser import parse as parse_date
from django.db import connections
from django.db.models import Q
from vmms.models import PLAYLIST_CONTENT_MODES, ExternalTag, Playlist, CachedPlaylist, LastUpdatedAt
import json


FIELD_DB_MAP = {
    'Title': 'title', 'Artist': 'artist', 'Artist addition': 'artist_addition',
    'Year': 'year', 'Album': 'album', 'Genre': 'genre', 'BPM': 'bpm',
    'Track-typ': 'track_type', 'Language': 'language', 'Saison': 'season',
    'Tempo': 'tempo', 'Mood': 'mood', 'Energy': 'energy_factory',
    'Coversong': 'coversong', 'Livesong': 'livesong', 'DJ-Mix': 'djmix',
    'Filler': 'filler', 'Favorit': 'favorit', 'Remix': 'remix',
    'Quality': 'quality', 'Popularity': 'knowledge', 'Voice': 'voice',
    'Season': 'season', 'Voice': 'voice', 'Speed': 'speed', 'Mood': 'mood',
    'Fame': 'fame', 'Energy': 'energy', 'Daytime': 'daytime', 'Cast': 'cast',
    'Target age': 'target_age', 'Created at': 'created_at', 'Username': 'username',
    'Updated at': 'updated_at', 'Version': 'version'
}

TEXT_FIELDS = [
    'title', 'artist', 'artist_addition', 'album',
    'genre', 'username',
]
FK_MATCH_FIELDS = [
    'language', 'season', 'voice', 'speed',
    'mood', 'fame', 'energy', 'daytime', 'cast',
]
FK_STRING_MATCH_FIELDS = [
    'version', 'target_age',
]
NUMERIC_FIELDS = [
    'year', 'bpm', 'status',
]
DATE_FIELDS = ['created_at', 'updated_at',]
BOOLEAN_FIELDS = [ ]

FILTER_FIELDS = TEXT_FIELDS + NUMERIC_FIELDS + BOOLEAN_FIELDS

SONGS_DB_NAME = 'import-tool'


"""Cache functions.

These are used for storing playlists in the application database
instead of querying the music DB.
"""

# Time for which cached playlist will be valid (in hours)
CACHE_TIME_TO_LIVE = 13


def cache_json_serializer(x):
    if isinstance(x, datetime):
        return x.isoformat()
    raise TypeError("Unknown type")


def write_playlist_to_cache(playlist_id, client_id, songs):
    cached_playlist = CachedPlaylist(
        playlist_id=playlist_id,
        client_id=client_id,
        songs=json.dumps(songs, default=cache_json_serializer)
    )
    cached_playlist.save()


def is_playlist_cached(playlist_id, client_id):
    cached_playlist = CachedPlaylist.objects.filter(playlist_id=playlist_id, client_id=client_id).first()
    if cached_playlist is not None:
        if cached_playlist.created_at + timedelta(hours=CACHE_TIME_TO_LIVE) <= datetime.now(pytz.utc):
            clear_cache_for_playlist(playlist_id=cached_playlist.playlist_id, client_id=cached_playlist.client_id)
            return False
        else:
            return True
    else:
        return False


def get_cached_playlist_songs(playlist_id, client_id):
    return json.loads(
        CachedPlaylist.objects.filter(playlist_id=playlist_id, client_id=client_id).first().songs)


def clear_cache_for_playlist(playlist_id, client_id):
    cached_playlist = CachedPlaylist.objects.filter(playlist_id=playlist_id, client_id=client_id).first()
    if cached_playlist is not None:
        cached_playlist.delete()


def clear_all_cache():
    CachedPlaylist.objects.all().delete()


clear_all_cache()

"""Cache functions end."""


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


def escape_tag(tag):
    return tag.replace("'", "\\'")


def get_by_id(id, rows):
    for row in rows:
        if id == row['id']:
            return row


def get_table_data(name):
    QUERY_TEMPLATE = '''
        SELECT * FROM {tablename}
    '''
    connection = connections[SONGS_DB_NAME]
    with connection.cursor() as cursor:
        cursor.execute(QUERY_TEMPLATE.format(tablename=name))
        return dictfetchall(cursor)
    

def get_filter_data():
    TABLES = {
        'Language': 'songs_languages',
        'Voice': 'songs_voices',
        'Version': 'songs_versions',
        'Cast': 'songs_casts',
        'Speed': 'songs_speeds',
        'Mood': 'songs_moods',
        'Energy': 'songs_energies',
        'Target age': 'songs_target_ages',
        'Fame': 'songs_fames',
        'Daytime': 'songs_daytimes',
        'Season': 'songs_seasons',
    }
    result = {}
    connection = connections[SONGS_DB_NAME]
    with connection.cursor() as cursor:
        for key, table_name in TABLES.items():
            result[key] = get_table_data(table_name)
    return result


class PlaylistQueueExecutor:
    @staticmethod
    def _sql_safe_str(source):
        return source

    @staticmethod
    def _map_field_name_to_db(field_name):
        return FIELD_DB_MAP[field_name]

    @staticmethod
    def _song_ids_to_query(ids, limit=None):
        QUERY = '''
            SELECT
                `s`.`id`,
                `s`.`status` AS `status`,
                `s`.`title` AS `title`,
                `s`.`artist` AS `artist`,
                `s`.`artist_addition` AS `artist_addition`,
                `s`.`year` AS `year`,
                `s`.`bpm` AS `bpm`,
                `s`.`album` AS `album`,
                `s`.`length` AS `length`,
                `s`.`cue_in` AS `cue_in`,
                `s`.`cue_out` AS `cue_out`,
                `s`.`hash` AS `hash`,
                `sfls`.`filename`,
                `sl`.`name` AS `language`,
                `sc`.`name` AS `cast`,
                `sv`.`name` AS `voice`,
                `ss`.`name` AS `speed`,
                `sm`.`name` AS `mood`,
                `se`.`name` AS `energy`,
                `sf`.`name` AS `fame`,
                `sd`.`name` AS `daytime`,
                `scs`.`name` AS `cast`,
                `ssns`.`name` AS `season`,
                `scvr`.`filename` AS `cover`,
                MAX(`sstaa`.`name`) AS `target_age`
            FROM 
                `songs` `s`
            JOIN `songs_languages` sl 
                ON `s`.`songs_language_id` = `sl`.`id`
            JOIN `songs_casts` sc
                ON `s`.`songs_cast_id` = `sc`.`id`
            JOIN `songs_voices` sv
                ON `s`.`songs_voice_id` = `sv`.`id`
            JOIN `songs_speeds` ss
                ON `s`.`songs_speed_id` = `ss`.`id`
            JOIN `songs_moods` sm
                ON `s`.`songs_mood_id` = `sm`.`id`
            JOIN `songs_energies` se
                ON `s`.`songs_energy_id` = `se`.`id`
            JOIN `songs_fames` sf
                ON `s`.`songs_fame_id` = `sf`.`id`
            JOIN `songs_daytimes` sd
                ON `s`.`songs_daytime_id` = `sd`.`id`
            JOIN `songs_seasons` ssns
                ON `s`.`songs_season_id` = `ssns`.`id`
            JOIN `songs_casts` scs
                ON `s`.`songs_cast_id` = `scs`.`id`
            JOIN `song_files` sfls
                ON `s`.`id` = `sfls`.`song_id`
            JOIN `song_songs_target_age` ssta
                ON `s`.`id` = `ssta`.`song_id`
            JOIN `songs_target_ages` sstaa
                ON `ssta`.`songs_target_age_id` = `sstaa`.`id`
            JOIN `covers` scvr
                ON `s`.`id` = `scvr`.`song_id` 
            WHERE `s`.`id` IN ({ids})
            GROUP BY `s`.`id`
            ORDER BY `s`.`id`
            {limit_block}
        '''
        query_kwargs = {'ids': ','.join([str(id) for id in ids])}
        if limit is not None:
            query_kwargs['limit_block'] = LIMIT_BLOCK.format(limit=limit)
        else:
            query_kwargs['limit_block'] = ''
        final_query = QUERY.format(**query_kwargs)
        return final_query

    @staticmethod
    def _filters_to_count_query(filters, genres, include_tags, exclude_tags):
        """Execute method.
        Good ol' SQL generation.
        """
        QUERY_WRAPPER = '''
            SELECT 
                COUNT(`id`) AS `total`
            FROM (
                {subquery}
            ) `s`
        '''
        subquery = PlaylistQueueExecutor._filters_to_query(filters, genres, include_tags, exclude_tags, None, None)

        final_query = QUERY_WRAPPER.format(subquery=subquery)

        return final_query


    @staticmethod
    def _filters_to_query(filters, genres, include_tags, exclude_tags, offset=None, limit=None, sort_by=None, sort_dir=None):
        """Execute method.
        Good ol' SQL generation.
        """

        QUERY = '''
            SELECT
                `s`.`id`,
                `s`.`status` AS `status`,
                `s`.`title` AS `title`,
                `s`.`artist` AS `artist`,
                `s`.`artist_addition` AS `artist_addition`,
                `s`.`year` AS `year`,
                `s`.`bpm` AS `bpm`,
                `s`.`album` AS `album`,
                `s`.`length` AS `length`,
                `s`.`cue_in` AS `cue_in`,
                `s`.`cue_out` AS `cue_out`,
                `s`.`tags` AS `tags`,
                `s`.`hash` AS `hash`,
                `sfls`.`filename`,
                `sl`.`name` AS `language`,
                `sc`.`name` AS `cast`,
                `sv`.`name` AS `voice`,
                `ss`.`name` AS `speed`,
                `sm`.`name` AS `mood`,
                `se`.`name` AS `energy`,
                `sf`.`name` AS `fame`,
                `sd`.`name` AS `daytime`,
                `ssns`.`name` AS `season`,
                `scvr`.`filename` AS `cover`,
                `s`.`songs_language_id`,
                `s`.`songs_cast_id`,
                `s`.`songs_voice_id`,
                `s`.`songs_speed_id`,
                `s`.`songs_mood_id`,
                `s`.`songs_fame_id`,
                `s`.`songs_daytime_id`,
                `s`.`songs_season_id`,
                `s`.`songs_energy_id`,
                `s`.`created_at`,
                `s`.`updated_at`,
                `s`.`genres` AS `genre`,
                `users`.`name` AS `username`,
                GROUP_CONCAT(`sstaa`.`name`) AS `target_age`,
                GROUP_CONCAT(`svs`.`name`) AS `version`
            FROM 
                {from_block}
            JOIN `songs_languages` sl 
                ON `s`.`songs_language_id` = `sl`.`id`
            JOIN `songs_casts` sc
                ON `s`.`songs_cast_id` = `sc`.`id`
            JOIN `songs_voices` sv
                ON `s`.`songs_voice_id` = `sv`.`id`
            JOIN `songs_speeds` ss
                ON `s`.`songs_speed_id` = `ss`.`id`
            JOIN `songs_moods` sm
                ON `s`.`songs_mood_id` = `sm`.`id`
            JOIN `songs_energies` se
                ON `s`.`songs_energy_id` = `se`.`id`
            JOIN `songs_fames` sf
                ON `s`.`songs_fame_id` = `sf`.`id`
            JOIN `songs_daytimes` sd
                ON `s`.`songs_daytime_id` = `sd`.`id`
            JOIN `songs_seasons` ssns
                ON `s`.`songs_season_id` = `ssns`.`id`
            JOIN `song_files` sfls
                ON `s`.`id` = `sfls`.`song_id`

            LEFT OUTER JOIN `song_songs_target_age` ssta
                ON `s`.`id` = `ssta`.`song_id`
            LEFT OUTER JOIN `songs_target_ages` sstaa
                ON `ssta`.`songs_target_age_id` = `sstaa`.`id`            
            
            LEFT OUTER JOIN `song_songs_version` ssvs
                ON `s`.`id` = `ssvs`.`song_id`
            LEFT OUTER JOIN `songs_versions` svs
                ON `ssvs`.`songs_version_id` = `svs`.`id`

            LEFT OUTER JOIN `covers` scvr
                ON `s`.`id` = `scvr`.`song_id`
            LEFT OUTER JOIN `users`
                ON `s`.`updated_by` = `users`.`id`
            GROUP BY `s`.`id`
            {cond_block}
            {order_by_block}
            {limit_block}
            {offset_block}
        '''
        GENRE_FROM = '''
            (
                    SELECT
                        `s`.*,
                        GROUP_CONCAT(`sstags`.`name`) AS `tags`,
                        GROUP_CONCAT(`gnrs`.`name`) AS `genres`
                        FROM `songs` s
                        LEFT JOIN `song_genre` sg
                            ON `s`.`id` = `sg`.`song_id`
                        LEFT OUTER JOIN `genres` gnrs
                            ON `sg`.`genre_id`= `gnrs`.`id`
                        LEFT OUTER JOIN `song_songs_tag` sst
                            ON `s`.`id` = `sst`.`song_id`
                        LEFT OUTER JOIN `songs_tags` `sstags`
                            ON `sst`.`songs_tag_id` = `sstags`.`id`
                    {where_block}
                        {genre_block}
                        {where_glue}
                        {tags_block}
                    GROUP BY
                        `s`.`id`
            ) s
        '''
        NO_GENRE_FROM = '''
            `songs` s
        '''
        COND_BLOCK = '''
            HAVING 
                {conditions}
        '''
        GENRE_BLOCK = '''
                `sg`.`genre_id` IN ({genre_ids})
        '''
        INCLUDE_TAGS_BLOCK = '''
                `sst`.`songs_tag_id` IN ({tag_ids})
        '''
        EXCLUDE_TAGS_BLOCK = '''
                `sst`.`songs_tag_id` NOT IN ({tag_ids})
        '''
        WHERE_GLUE = ''' AND '''
        ORDER_BY_BLOCK = '''
            ORDER BY {order_by_field} {order_by_dir}
        '''
        LIMIT_BLOCK = '''
            LIMIT {limit}
        '''
        OFFSET_BLOCK = '''
            OFFSET {offset}
        '''

        conditions = [
            " `status` = 1 "
        ]
        operator = None
        value = None

        target_age_lookup = get_table_data('songs_target_ages')
        version_lookup = get_table_data('songs_versions')

        grouped_filters = {}
        for f in filters:
            if f.field not in grouped_filters:
                grouped_filters[f.field] = []
            grouped_filters[f.field].append(f)

        for field_name, values in grouped_filters.items():
            field_name = PlaylistQueueExecutor._map_field_name_to_db(field_name)
            field_conditions = []

            logic_operator = 'OR'
            if values[0].word == 'is not':
                logic_operator = 'AND'

            for f in values:
                db_field_name = field_name
                db_field_name = '{}'.format(db_field_name)
                condition_ready = False
                condition = '{} {} {}'             
                if field_name in TEXT_FIELDS:
                    if 'contain' not in f.word:
                        value = '"{}"'.format(f.value)
                    else:
                        value = f.value
                    if f.word == 'is':
                        operator = '='
                    elif f.word == 'is not':
                        operator = '!='
                    elif f.word == 'contains':
                        operator = 'LIKE'
                        value = "\"%{}%\"".format(value)
                    elif f.word == 'does not contain':
                        operator = 'NOT LIKE'
                        value = "\"%{}%\"".format(value)
                    condition_ready = True
                elif field_name in NUMERIC_FIELDS:
                    value = f.value
                    if f.word == 'equals to':
                        operator = '='
                    elif f.word == 'does not equal to':
                        operator = '!='
                    elif f.word == 'less than':
                        operator = '<'
                    elif f.word == 'greater than':
                        operator = '>'
                    elif f.word == 'less than or equals to':
                        operator = '<='
                    elif f.word == 'greater than or equals to':
                        operator = '>='
                    condition_ready = True
                elif field_name in FK_MATCH_FIELDS:
                    try:
                        value = int(f.value)
                    except ValueError as e:
                        continue
                    if f.word == 'is':
                        operator = '='
                    elif f.word == 'is not':
                        operator = '!='
                    db_field_name = 'songs_' + db_field_name + '_id'
                    condition_ready = True
                elif field_name in FK_STRING_MATCH_FIELDS:
                    try:
                        value = int(f.value)
                    except ValueError as e:
                        continue
                    if field_name == 'target_age':
                        value = get_by_id(value, target_age_lookup).get('name', '')
                    elif field_name == 'version':
                        value = get_by_id(value, version_lookup).get('name', '')
                    if f.word == 'is':
                        operator = '='
                        value = '\'' + value + '\''
                    elif f.word == 'is not':
                        operator = 'NOT LIKE'
                        value = '\'%' + value + '%\''
                    db_field_name = 'IFNULL(' + db_field_name + ', \'\')'
                    condition_ready = True
                elif field_name in BOOLEAN_FIELDS:
                    if f.value == 'Yes':
                        value = 'true'
                    elif f.value == 'No':
                        value = 'false'
                    else:
                        raise Exception('Unknown boolean value')
                    if f.word == 'is':
                        operator = '='
                    elif f.word == 'is not':
                        operator = '!='
                    condition_ready = True
                elif field_name in DATE_FIELDS:
                    value = parse_date(f.value)
                    value = 'STR_TO_DATE(\'{}\', \'%Y-%m-%d %H:%i:%s\')'.format(value.strftime("%Y-%m-%d %H:%M:%S"))
                    if f.word == 'before':
                        operator = '<'
                    elif f.word == 'after':
                        operator = '>'
                    condition_ready = True
                else:
                    print('Cannot generate condition')
                if condition_ready:
                    condition = condition.format(db_field_name, operator, value)
                    field_conditions.append(condition)
            conditions.append('(' +  ((' ' + logic_operator + ' ').join(field_conditions)) + ')')

        INCLUDE_TAG_COND = 'IFNULL(s.tags, \'\') LIKE \'%{}%\''
        EXCLUDE_TAG_COND = 'IFNULL(s.tags, \'\') NOT LIKE \'%{}%\''

        # Include tags
        if len(include_tags) > 0:
            include_tag_objs = ExternalTag.objects.using(SONGS_DB_NAME).filter(id__in=include_tags.split(','))
            for it in include_tag_objs:
                conditions.append(INCLUDE_TAG_COND.format(escape_tag(it.name)))
        # Exclude tags
        if len(exclude_tags) > 0:
            exclude_tag_objs = ExternalTag.objects.using(SONGS_DB_NAME).filter(id__in=exclude_tags.split(','))
            for it in exclude_tag_objs:
                conditions.append(EXCLUDE_TAG_COND.format(escape_tag(it.name)))

        query_kwargs = {}
        genre_kwargs = {}
        if limit is not None:
            query_kwargs['limit_block'] = LIMIT_BLOCK.format(limit=limit)
        else:
            query_kwargs['limit_block'] = ''
        if offset is not None:
            query_kwargs['offset_block'] = OFFSET_BLOCK.format(offset=offset)
        else:
            query_kwargs['offset_block'] = ''
        
        if len(genres) > 0:
            genre_kwargs['where_block'] = ' WHERE '
            if len(genres) > 0:
                genre_kwargs['genre_block'] = GENRE_BLOCK.format(genre_ids=genres)
            else:
                genre_kwargs['genre_block'] = ''
        else:
            genre_kwargs['genre_block'] = ''
            genre_kwargs['where_block'] = ''
        genre_kwargs['tags_block'] = ''
        genre_kwargs['where_glue'] = ''

        query_kwargs['from_block'] = GENRE_FROM.format(**genre_kwargs)
        
        if len(conditions) > 0:
            conds = COND_BLOCK.format(conditions=' AND '.join(conditions))
            query_kwargs['cond_block'] = conds
        else:
            query_kwargs['cond_block'] = ''

        if not sort_by and not sort_dir:
            query_kwargs['order_by_block'] = ''
        else:
            order_by_kwargs = {}
            if sort_by is not None:
                order_by_kwargs['order_by_field'] = sort_by
            else:
                order_by_kwargs['order_by_field'] = '`s`.`id`'

            if sort_dir is not None:
                order_by_kwargs['order_by_dir'] = sort_dir
            else:
                order_by_kwargs['order_by_dir'] = 'DESC'
            query_kwargs['order_by_block'] = ORDER_BY_BLOCK.format(**order_by_kwargs)

        final_query = QUERY.format(**query_kwargs)
        return final_query

    @staticmethod
    def _genres_to_query(song_id, genres):
        QUERY = '''
            SELECT COUNT(id) AS genre_matches_count
            FROM `song_genre` sg
            WHERE 
                `sg`.`genre_id` IN ({genres}) AND
                `sg`.`song_id` = {song_id}
        '''
        query = QUERY.format(genres=genres, song_id=song_id)
        return query

    @staticmethod
    def fetch_songs_for_playlist_and_client(playlist, client, limit=None):
        if is_playlist_cached(playlist.id, client.id):
            return get_cached_playlist_songs(playlist.id, client.id)
        if playlist.content_mode == PLAYLIST_CONTENT_MODES['FILTERS_AND_GENRES']:
            songs = PlaylistQueueExecutor.fetch_songs_fg(
                list(playlist.filters.all()) + list(client.filters.all()),
                playlist.genres,
                playlist.include_tags,
                playlist.exclude_tags,
                limit
            )
            write_playlist_to_cache(playlist.id, client.id, songs)
            return songs
        else:
            ids = []
            psongs = playlist.songs.all()
            for ps in psongs:
                ids.append(ps.song.id)
            return PlaylistQueueExecutor.fetch_songs_mn(
                ids,
                limit
            )

    @staticmethod
    def fetch_songs_count_fg(filters, genres='',  include_tags='', exclude_tags=''):
        result = []
        query = PlaylistQueueExecutor._filters_to_count_query(filters, genres, include_tags, exclude_tags)
        connection = connections[SONGS_DB_NAME]
        with connection.cursor() as cursor:
            cursor.execute(query)
            songs = dictfetchall(cursor)
        if len(songs) == 0:
            return 0
        else:
            return songs[0]['total']

    @staticmethod
    def fetch_songs_count_for_playlist(playlist):
        return PlaylistQueueExecutor.fetch_songs_count_fg(
            playlist.filters.all(),
            playlist.genres,
            playlist.include_tags,
            playlist.exclude_tags
        )

    @staticmethod
    def fetch_songs_count_for_program(program):
        ids = []
        for pl in program.playlists.all():
            ids.append(pl.playlist_id)
        return PlaylistQueueExecutor.fetch_songs_count_program(ids)

    @staticmethod
    def fetch_songs_fg(
        filters, genres='',
        include_tags='', exclude_tags='',
        limit=None, offset=None,
        sort_by=None, sort_dir=None):
        result = []
        query = PlaylistQueueExecutor._filters_to_query(
            filters, genres,
            include_tags, exclude_tags,
            offset, limit,
            sort_by, sort_dir
        )
        connection = connections[SONGS_DB_NAME]
        with connection.cursor() as cursor:
            cursor.execute(query)
            songs = dictfetchall(cursor)
        return songs

    @staticmethod
    def fetch_songs_count_program(playlist_ids):
        result = []
        queries = []
        for playlist_id in playlist_ids:
            playlist = Playlist.objects.get(pk=playlist_id)
            query = PlaylistQueueExecutor._filters_to_count_query(
                playlist.filters.all(), playlist.genres,
                playlist.include_tags, playlist.exclude_tags
            )
            queries.append(query)
        query = ' UNION '.join(queries)
        query = '''
            SELECT
                SUM(`r`.`total`) AS `total`
            FROM
                ({}) `r`
        '''.format(query)
        connection = connections[SONGS_DB_NAME]
        with connection.cursor() as cursor:
            cursor.execute(query)
            songs = dictfetchall(cursor)
        if len(songs) == 0:
            return 0
        else:
            return songs[0]['total']

    @staticmethod
    def fetch_songs_program(playlist_ids, per_page,
                            offset, sort_by, sort_dir):
        result = []
        queries = []
        for playlist_id in playlist_ids:
            playlist = Playlist.objects.get(pk=playlist_id)
            query = PlaylistQueueExecutor._filters_to_query(
                playlist.filters.all(), playlist.genres,
                playlist.include_tags, playlist.exclude_tags
            )
            queries.append(query)
        query = ' UNION '.join(queries)
        if sort_by and sort_dir:
            query += ' ORDER BY {} {}'.format(sort_by, sort_dir)
        if per_page is not None and offset is not None:
            query += ' LIMIT {} OFFSET {}'.format(per_page, offset)
        connection = connections[SONGS_DB_NAME]
        with connection.cursor() as cursor:
            cursor.execute(query)
            songs = dictfetchall(cursor)
        return songs

    @staticmethod
    def fetch_songs_mn(ids, limit=None):
        result = []
        query = PlaylistQueueExecutor._song_ids_to_query(ids, limit)
        connection = connections[SONGS_DB_NAME]
        with connection.cursor() as cursor:
            cursor.execute(query)
            songs = dictfetchall(cursor)
        return songs
