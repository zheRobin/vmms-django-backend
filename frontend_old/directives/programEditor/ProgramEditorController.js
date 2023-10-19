import _ from 'lodash';
import { transform } from '../../transform.js';


/* @ngInject */
const ProgramEditorController =
function($rootScope, $scope, $q, Restangular, Notification) {
    let validate = (program) => {
        let errors = [];
        if(program.name === undefined || program.name === '') {
            errors.push('Program name cannot be empty.');
        }
        if(program.parent === undefined) {
            errors.push('Program parent was not selected.');
        }
        if(program.playlists === undefined || program.playlists.length === 0) {
            errors.push('Program must contain at least 1 playlist.');
        }
        _.each(program.playlists, (p, i) => {
            if(p.playlist === undefined) {
                errors.push('Playlist #' + (i + 1) + ' was not selected.');
            }
        });
        if(program.color === undefined) {
            errors.push('Please select program color.');
        }
        return errors;
    }

    let transformRules = {
        playlists: {
            forward: function(value) {
                let promises = _.map(value, (programPlaylist) => {
                        let deferred, playlistId;
                        playlistId = programPlaylist.playlist;
                        if(typeof(playlistId) === 'number') {
                            deferred = $q.defer();
                            Restangular
                                .one('playlist', playlistId)
                                .get()
                                .then((playlist) => {
                                    programPlaylist.playlist = playlist;
                                    deferred.resolve(programPlaylist);
                                });
                            return deferred.promise;
                        } else {
                            return programPlaylist;
                        }
                    }
                );
                return $q.all(promises);
            },
            backward: function(value) {
                return _.map(value, (p) => {
                    return {
                        percentage: p.percentage,
                        playlist: p.playlist.id
                    }
                });
            }
        }
    };

    let refreshProgramFolders = () => {
        Restangular
            .all('program-folder')
            .getList()
            .then((programFolders) => $scope.parents = _.orderBy(programFolders, (folder) => folder.name.toLowerCase()));
    };

    let fixPercentages = (program) => {
        const MAX_PERCENTAGE = 100;
        const MIN_PERCENTAGE = 0;

        let totalPercentage = _.sum(_.map(program.playlists, (p) => p.percentage));
        let diff = MAX_PERCENTAGE - totalPercentage;
        let d = Math.ceil(diff / program.playlists.length);

        let excluded = [];
        let oldLength = -1;
        let newPercentage;
        while(oldLength != excluded.length) {
            oldLength = excluded.length;
            _.each(program.playlists, (p, i) => {
                newPercentage = p.percentage + d;
                if(newPercentage > MAX_PERCENTAGE || newPercentage < MIN_PERCENTAGE) {
                    excluded = _.union([i], excluded);
                }
            });
            d = Math.ceil(diff / (program.playlists.length - excluded.length));
        }
        _.each(program.playlists, (p, i) => {
            if(!_.includes(excluded, i)) {
                p.percentage += d;
            }
        });
    };

    $scope.alert = (msg) => {
        window.alert(msg);
    };
    $scope.clientsToList = (clients) => {
        clients = _.uniqBy(clients, 'id');
        clients = _.map(clients, (client) => client.name);
        return clients.join(', ');
    };

    $scope.save = () => {
        fixPercentages($scope.program);
        let formatErrorMsgFromResponse = (response) => {
            if(typeof response.data === 'object') {
                let errors = response.data;
                errors = _.map(errors, (error, fieldName) => {
                    return fieldName + ': ' + error;
                });
                return ('Cannot save program:<br>' + errors.join('<br>'));
            } else {
                return ('Unexpected error occured. Please, report this incident.');
            }
        };
        let formatErrors = (errors) => {
            return 'Cannot save program:<br>' + errors.join('<br>');
        };
        let showErrorMsg = (msg) => {
            Notification.error(msg);
        };
        let errors = validate($scope.program);
        if(errors.length > 0) {
            showErrorMsg(formatErrors(errors));
            return;
        }
        transform(transformRules, $scope.program, 'backward', Restangular)
            .then((transformed) => {
                if($scope.isNew) {
                    Restangular
                        .all('program')
                        .post(transformed)
                        .then(
                            (program) => {
                                transform(transformRules, program, 'forward', Restangular)
                                    .then((transformed) => $scope.$apply(() => $scope.program = transformed));
                                Notification.success('New program has been created.');
                                $rootScope.$broadcast('program:created');
                            },
                            (response) => {
                                showErrorMsg(formatErrorMsgFromResponse(response));
                            }
                        );
                } else {
                    // Manually fixing routing issue
                    // see: https://github.com/mgonto/restangular/issues/769
                    transformed.route = 'program';
                    transformed
                        .put()
                        .then(
                            () => {
                                Notification.success('Program successfuly updated.');
                                $rootScope.$broadcast('program:updated');
                            },
                            () => {
                                showErrorMsg(formatErrorMsgFromResponse(response));
                            }
                        );
                }
            });
    };

    $scope.delete = () => {
        let confirmed = confirm('Are you sure you want to delete this program? This action cannot be reversed.');
        if(confirmed) {
            delete $scope.program.source;
            $scope.program.route = 'program';
            $scope
                .program
                .remove()
                .then(
                    () => {
                        $rootScope.$broadcast('program:deleted');
                        Notification.success('Program deleted sucessfuly.');
                    }
                )
        }
    };

    $scope.previewChange = (params) => {
        if($scope.program !== undefined) {
            $scope.fetchPreview(params);
        };
    };

    $scope.fetchPreview = () => {
        if($scope.program === undefined) {
            Notification.info('No program to preview');
            return;
        }
        let processed = $scope.program;
        let playlistIds = _.map($scope.program.playlists, (playlist) => playlist.playlist.id);
        let params = $scope.previewParams;

        $scope.showPreview = true;
        $scope.previewLoading = true;
        Restangular
            .all('program')
            .customPOST({
                playlistIds: playlistIds,
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
    };

    $scope.$watch('program', (newModel) => {
        if(!newModel || !newModel.$transformed) {
            transform(transformRules, newModel, 'forward', Restangular)
                .then((transformed) => {
                    $scope.$apply(() => {
                        $scope.showPreview = false;
                        $scope.program = transformed;
                        if($scope.program.id) {
                            Restangular
                                .one('program', $scope.program.id)
                                .customGET('dependents')
                                .then((deps) => $scope.dependents = deps);
                        }
                    });
                });
        } else {
            $scope.isNew = $scope.program.id === undefined;
        }
    });

    $scope.$on('program-folder:deleted', refreshProgramFolders);
    $scope.$on('program-folder:created', refreshProgramFolders);
    $scope.$on('program-folder:updated', refreshProgramFolders);

    refreshProgramFolders();
};

export default ProgramEditorController;
