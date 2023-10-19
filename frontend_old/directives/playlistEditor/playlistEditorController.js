import _ from 'lodash';
import $ from 'jquery';
import { restangularFix } from '../../util.js';


/* @ngInject */
const PlaylistEditorController =
function($q, $rootScope, $scope, Restangular, Notification, $timeout) {
    const PLAYLIST_CONTENT_MODES = {
        FILTERS_AND_GENRES: 0,
        MANUAL: 1
    };
    const PLAYLIST_DEFAULT_FILTERS = [
        { field: 'Season', word: 'is not', value: '4' },
        { field: 'Language', word: 'is', value: '2' }
    ];

    $scope.contentModeOptions = [
        {
            label: "Filters & Genres",
            value: 0
        },
        {
            label: "Manual song selection",
            value: 1
        }
    ];

    let allTags = [];
    Restangular
        .all('tag')
        .getList()
        .then((tags) => allTags = tags);

    let originalPlaylist;
    // Validation
    let validateFilters = (filters) => {
        let errors = [];
        _.each(filters, (filter) => {
            if(filter.field === '' || filter.field === undefined) {
                errors.push('Filter field cannot be empty');
                return false;
            }
            if(filter.word === '' || filter.word === undefined) {
                errors.push('Filter word cannot be empty');
                return false;
            }
            if(filter.value === '' || filter.value === undefined) {
                errors.push('Filter value cannot be empty');
                return false;
            }
        });
        return errors;
    }
    let validate = (playlist, isNew) => {
        let errors = [];
        if(playlist.name === '' || playlist.name === undefined) {
            errors.push('Playlist name cannot be empty');
        }
        let filterErrors = validateFilters(playlist.filters);
        errors = _.union(errors, filterErrors);
        if(playlist.parent === undefined) {
            errors.push('Playlist has to have a parent.');
        }
        if(playlist.color === undefined) {
            errors.push('Please select playlist color.');
        }
        return errors;
    };
    let preProcess = (playlist) => {
        let processTags = (tags) => {
            if(typeof tags === 'string') {
                if(tags === '') {
                    tags = [];
                } else {
                    tags = tags.split(',');
                }
            }
            tags = _.map(tags, (tagId) => {
                return _.find(allTags, (tag) => tag.id == tagId)
            });
            tags = _.filter(tags, (tag) => tag !== undefined);
            return tags;    
        };

        playlist = Restangular.copy(playlist);

        // If the playlist is new
        if(playlist.id === undefined) {
            // Set default filters
            playlist.filters = PLAYLIST_DEFAULT_FILTERS;
        }

        if(typeof playlist.genres === 'string') {
            let obj;
            playlist.genres = _.reduce(playlist.genres.split(','), (acc, genre) => {
                acc[genre] = true;
                return acc;
            }, {});
        }
        
        // Tags
        playlist.include_tags = processTags(playlist.include_tags);
        playlist.exclude_tags = processTags(playlist.exclude_tags);
        
        playlist.songs = _.map(playlist.songs, (s) => s.song);
        $scope.active = playlist.content_mode;
        playlist.$processed = true
        return playlist;
    };
    let postProcess = (playlist) => {
        let processTags = (tags) => {
            tags = _.map(tags, (tag) => {
                return tag.id;
            });
            tags = tags.join(',');
            return tags;
        }

        playlist = Restangular.copy(playlist);
        
        // Genres
        playlist.genres = _.map(playlist.genres, (value, genreId) => {
            if(value) 
                return genreId;
            else
                return '';
        });
        playlist.genres = _.filter(playlist.genres, (value) => value != '');
        playlist.genres = playlist.genres.join(',');
        if(playlist.genres === undefined) {
            playlist.genres = '';
        }
        // Tags
        playlist.include_tags = processTags(playlist.include_tags);
        playlist.exclude_tags = processTags(playlist.exclude_tags);

        playlist.songs = _.map(playlist.songs, (s) => { return {song: s}; })
        //playlist = restangularFix(Restangular, playlist);
        return playlist;
    };
    // Refresh parents list
    let refreshPlaylistFolders = () => {
        Restangular
            .all('playlist-folder')
            .getList()
            .then((playlistFolders) => $scope.parents = _.orderBy(playlistFolders, (folder) => folder.name.toLowerCase()));
    };




    let tryFetchPreview = () => {
        if($scope.playlist !== undefined && $scope.playlist.content_mode !== undefined) {
            $scope.fetchPreview();
        }
    }

    $scope.$watch('sortDir', tryFetchPreview);
    $scope.$watch('sortBy', tryFetchPreview);
    $scope.$watch('perPage', tryFetchPreview);

    // Whenever content mode changes we need to force a
    // window resize event in order for masonry layout to
    // rerender itself
    $scope.$watch('playlist.content_mode', () => {
        $timeout(function () {
           if (document.createEvent) { // W3C
                var ev = document.createEvent('Event');
                ev.initEvent('resize', true, true);
                window.dispatchEvent(ev);
            } else { // IE
                document.fireEvent('onresize');
            }
        }, 200);
    });

    $scope.$watch('playlist', (newPlaylist) => {
        if(newPlaylist !== undefined) {
            $scope.isNew = newPlaylist.id === undefined;
            if(newPlaylist.parent === null) {
                delete newClient.parent;
            }
            originalPlaylist = Restangular.copy(newPlaylist);
            if(!newPlaylist.$processed) {
                $scope.playlist = preProcess(newPlaylist);
                $scope.showPreview = false;
                if($scope.playlist.id) {
                    Restangular
                        .one('playlist', $scope.playlist.id)
                        .customGET('dependents')
                        .then((deps) => $scope.dependents = deps);
                }
            }
        }
    });

    $scope.clientsToList = (clients) => {
        clients = _.uniqBy(clients, 'id');
        clients = _.map(clients, (client) => client.name);
        return clients.join(', ');
    };

    $scope.loadTags = ($query) => {
        let availableTags = _.differenceBy(
            allTags,
            $scope.playlist.include_tags,
            $scope.playlist.exclude_tags,
            'id'
        );
        if($query !== '' && $query !== undefined) {
            let query = new RegExp(_.toLower($query));
            let results = _.filter(availableTags, (tag) => query.test(_.toLower(tag.name)));
            return results;
        } else {
            return availableTags;
        }
    }

    $scope.onSongSelect = ($song) => {
        if($scope.playlist.songs === undefined) {
            $scope.playlist.songs = [];
        }
        $scope.playlist.songs.push($song);
    }
    $scope.active = 1;
    $scope.parents = [];
    $scope.isNew = true;
    
    // Save method
    $scope.save = () => {
        let errors = validate($scope.playlist, $scope.isNew);
        if(errors.length > 0) {
            Notification.error('Cannot save playlist:<br>' + errors.join('<br>'));
            return;
        }
        let errorHandler = (response) => {
            if(typeof response.data === 'object') {
                let errors = response.data;
                errors = _.map(errors, (err) => err);
                Notification.error('Cannot save playlist:<br>' + errors.join('<br>'));
            } else {
                Notification.error('Unexpected error occured. Please, report this incident.')
            }
        };
        if($scope.playlist.parent === undefined) {
            $scope.playlist.parent = null;
        }
        let playlist = postProcess($scope.playlist);
        if($scope.isNew) {
            Restangular
                .all('playlist')
                .post(playlist)
                .then(
                    (playlist) => {
                        delete playlist.$processed;
                        Notification.success(
                            'New playlist has been created.'
                        );
                        originalPlaylist = Restangular.copy(playlist);
                        $scope.playlist = preProcess(playlist);
                        $rootScope.$broadcast('playlist:created');
                    },
                    errorHandler
                );
        } else {
            playlist
                .put()
                .then(
                    (playlist) => {
                        $scope.playlist = preProcess(playlist);
                        originalPlaylist = Restangular.copy($scope.playlist);
                        Notification.success(
                            'Playlist has been updated'
                        );
                        $rootScope.$broadcast('playlist:updated');
                    },
                    errorHandler
                );
        }
    };
    $scope.reset = () => {
        $scope.playlist = Restangular.copy(originalPlaylist);        
    };

    $scope.previewChange = (params) => {
        if($scope.playlist !== undefined) {
            $scope.fetchPreview(params);
        }
    };

    $scope.fetchPreview = () => {
        let params = $scope.previewParams;

        if($scope.playlist === undefined || $scope.playlist.content_mode === undefined) {
            Notification.info('No playlist to preview');
            return;
        }
        let processed = postProcess($scope.playlist);
        if(processed.filters.length === 0 &&
           processed.genres.length === 0 &&
           processed.include_tags.length === 0 &&
           processed.exclude_tags.length === 0) {
            Notification.info(
                'Note: no filters added, no genres and no tags were selected.'
            );
        }
        let errors = validateFilters($scope.playlist.filters);
        if(errors.length > 0) {
            Notification.error(
                'Invalid filters. Please fill out all filter fields and try again.'
            );
            return;
        }

        $scope.showPreview = true;
        $scope.previewLoading = true;
        if(processed.content_mode == PLAYLIST_CONTENT_MODES.FILTERS_AND_GENRES) {
            Restangular
                .all('playlist')
                .customPOST({
                    content_mode: processed.content_mode,
                    filters: processed.filters,
                    genres: processed.genres,
                    include_tags: processed.include_tags,
                    exclude_tags: processed.exclude_tags,
                    per_page: params.perPage,
                    page: params.page,
                    sort_dir: params.sortDir,
                    sort_by: params.sortBy
                }, 'preview')
                .then((response) => {
                    $scope.previewLoading = false;
                    $scope.preview = response.songs;
                    $scope.songsCount = response.total;
                });
        }
    };

    $scope.enableFilters = () => {
        if($scope.playlist)
            $scope.playlist.content_mode = PLAYLIST_CONTENT_MODES.FILTERS_AND_GENRES;
    }
    $scope.enableManual = () => {
        if($scope.playlist)
            $scope.playlist.content_mode = PLAYLIST_CONTENT_MODES.MANUAL;
    }

    $scope.$on('playlist-folder:deleted', refreshPlaylistFolders);
    $scope.$on('playlist-folder:created', refreshPlaylistFolders);
    $scope.$on('playlist-folder:updated', refreshPlaylistFolders);

    refreshPlaylistFolders();
};

export default PlaylistEditorController;