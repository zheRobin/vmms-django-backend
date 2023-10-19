import hashlib, random
from vmms.models import PLAYLIST_CONTENT_MODES
from .settings import SECRET_KEY


ALL_FILTER = {'field': 'Season', 'word': 'is', 'value': '1'}
SUMMER_FILTER = {'field': 'Season', 'word': 'is not', 'value': '2'}
WINTER_FILTER = {'field': 'Season', 'word': 'is not', 'value': '3'}
CHRISTMAS_FILTER = {'field': 'Season', 'word': 'is not', 'value': '4'}

FILTERS_PREFIX = '🇩'
MANUAL_PREFIX = '🇸'
SEASON_PREFIXES = {
    'all_year': '🎵',
    'winter': '❄️',
    'summer': '☀️',
    'christmas': '🎄'
}


def generate_api_key():
    key = hashlib.sha224(
        (str(random.getrandbits(256)) + SECRET_KEY).encode('utf-8')
    ).hexdigest()
    return key


def generate_secret_login_key():
    return generate_api_key()


def playlist_contains_filter(playlist, filter):
    for f in playlist.filters.all():
        if (filter['field'] == f.field and
                filter['word'] == f.word and
                filter['value'] == f.value):
            return True
    return False


def get_playlist_seasons(playlist):
    all_seasons = ['all_year', 'winter', 'summer', 'christmas']
    excluded_seasons = []
    if playlist.filters and len(playlist.filters.all()) > 0:
        if playlist_contains_filter(playlist, SUMMER_FILTER):
            excluded_seasons.append('summer')
        if playlist_contains_filter(playlist, WINTER_FILTER):
            excluded_seasons.append('winter')
        if playlist_contains_filter(playlist, CHRISTMAS_FILTER):
            excluded_seasons.append('christmas')
        if playlist_contains_filter(playlist, ALL_FILTER):
            excluded_seasons.append('all_year')
    result = set(all_seasons) - set(excluded_seasons)
    return list(result)


def get_playlist_prefix(playlist):
    if playlist.content_mode == PLAYLIST_CONTENT_MODES['FILTERS_AND_GENRES']:
        prefixes = [FILTERS_PREFIX]
        prefixes += map(lambda season: SEASON_PREFIXES[season], get_playlist_seasons(playlist))
        return ' '.join(prefixes)
    else:
        return MANUAL_PREFIX


def get_program_prefix(program):
    seasons = set()
    for pplaylist in program.playlists.all():
        seasons.update(get_playlist_seasons(pplaylist.playlist))
    prefix = ' '.join(map(lambda season: SEASON_PREFIXES[season], seasons))
    return prefix
