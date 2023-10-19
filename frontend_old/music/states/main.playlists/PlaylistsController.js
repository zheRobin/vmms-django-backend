import _ from 'lodash';
import bootbox from 'bootbox';
import { buildFolderedTree, traverseTree, restangularFix, filterTree } from '../../../util.js';


const COPIED_SUFFIX = ' - copy';

const PREFIX_TOOLTIPS = {
    '🇩': 'Dynamic',
    '🇸': 'Static',
    '🎵': 'All year',
    '❄️': 'Winter',
    '☀️': 'Summer',
    '🎄': 'Christmas'
};

/* @ngInject */
const PlaylistsController =
function($scope, $rootScope, $sce, $q, Restangular, Notification) {
    let show = (str) => {
        if(str === 'playlistEditor') {
            $scope.showPlaylistEditor = true;
            $scope.showFolderEditor = false;
            $scope.showWelcome = false;
        } else if(str === 'folderEditor') {
            $scope.showPlaylistEditor = false;
            $scope.showFolderEditor = true;
            $scope.showWelcome = false;
        } else if(str === 'welcome') {
            $scope.showPlaylistEditor = false;
            $scope.showFolderEditor = false;
            $scope.showWelcome = true;
        }
    };

    $scope.showLoader = false;

    let buildTree = (entities) => {
        return _.orderBy(
            buildFolderedTree(
                _.sortBy(entities.folders, 'name'),
                _.sortBy(entities.playlists, 'name')
            ), (folder) => folder.name.toLowerCase()
        );
    };

    let refreshTree = () => {
        $q.all([
            Restangular
                .all('playlist-folder')
                .getList(),
            Restangular
                .all('playlist')
                .getList()
        ]).then((results) => {
            $scope.folders = _.orderBy(results[0], (folder) => folder.name.toLowerCase());
            let selectedId, selectedRoute;
            if($scope.selectedNode &&  $scope.selectedNode.id) {
                selectedId = $scope.selectedNode.id;
                selectedRoute = $scope.selectedNode.route;
            }
            $scope.playlistsTree = buildTree({
                folders: results[0],
                playlists: results[1]
            });
            $scope.originalTree = angular.copy($scope.playlistsTree);
            if(selectedId !== undefined && selectedRoute !== undefined) {
                traverseTree($scope.playlistsTree, (node) => {
                    if(node.id == selectedId && node.route === selectedRoute) {
                        $scope.selectedNode = node;
                    }
                })
            }
            $scope.labels = _.reduce(_.map(results[1], (playlist) => {
                    playlist.prefix = _.map(
                        playlist.prefix.split(' '),
                        (prefix) => {
                            return ('<div class="ttip">' + prefix +  
                                       '<span class="ttiptext">' + PREFIX_TOOLTIPS[prefix] + '</span>' +
                                    '</div>')
                        }
                    ).join(' ');
                    return playlist;
                }), 
                (acc, playlist) => {
                    acc[playlist.route + playlist.id] = $sce.trustAsHtml(playlist.prefix + ' ' + playlist.name);
                    if(playlist.songs_count) {
                        acc[playlist.route + playlist.id] += ' <b>(' + playlist.songs_count + ')</b>';
                        acc[playlist.route + playlist.id] = $sce.trustAsHtml(acc[playlist.route + playlist.id]);
                    }
                    return acc;
                }, {});
            _.each(results[0], (playlistFolder) => {
                $scope.labels[playlistFolder.route + playlistFolder.id] = $sce.trustAsHtml(playlistFolder.name);
            });
        });
    };

    $scope.labels = {};

    $scope.onSelection = (node, selected) => {
        $scope.selectedNode = node;
        if(node.route === 'playlist') {
            $scope.showLoader = true;
            Restangular
                .one('playlist', node.id)
                .get()
                .then(
                    (playlist) => {
                        show('playlistEditor');
                        $scope.editedPlaylist = playlist;
                        $scope.showLoader = false;
                    },
                    () => $scope.showLoader = false
                );
        } else if(node.route === 'playlist-folder') {
            show('folderEditor');
        }
    };

    $scope.removeSelected = () => {
        let objName = $scope.selectedNode.route === 'playlist' ? 'playlist' : 'playlist folder';
        if($scope.selectedNode && $scope.selectedNode !== {}) {
            let confirmed1 = confirm(
                "Are you sure you want to delete this " + objName + "? " +
                "This action is irreversible."
            );
            let confirmed2 = true;
            if(confirmed1
            && $scope.selectedNode.children 
            && $scope.selectedNode.children.length > 0) {
                confirmed2 = confirm(
                    "This " + objName + " contains playlists. " + 
                    "Deleting it will also remove ALL the playlists in it. " + 
                    "Are you sure you want to continue? " +
                    "This action is irreversible."
                );
            }
            if(confirmed1 && confirmed2) {
                $scope
                    .selectedNode
                    .remove()
                    .then(() => {
                        $scope.selectedNode = null;
                        Notification.success(_.capitalize(objName) + " has been deleted.");
                        if(objName === 'playlist') {
                            $rootScope.$broadcast('playlist:deleted')
                            delete $scope.editedModel;
                        } else {
                            $rootScope.$broadcast('playlist-folder:deleted')
                        }
                    });
            }
        } else {
            Notification.error('Cannot remove this ' + objName + '.');
        }
    };

    $scope.createNewFolder = () => {
        bootbox.prompt(
            "Enter new playlist folder name",
            (name) => {
                let folder = { name: name };
                Restangular
                    .all('playlist-folder')
                    .post(folder)
                    .then(() => {
                        Notification.success('New playlist folder created.');
                        $rootScope.$broadcast('playlist-folder:created');
                    });
            }
        );
    };

    $scope.renameSelectedFolder = () => {
        let folder = $scope.selectedNode;
        bootbox.prompt(
            "Enter new folder name",
            (name) => {
                if(name !== null && name !== '') {
                    folder.name = name;
                    folder = restangularFix(Restangular, folder);
                    folder
                        .put()
                        .then(
                            () => {
                                Notification.success('Playlist folder renamed');
                                $rootScope.$broadcast('playlist-folder:updated');
                            },
                            () => {
                                Notification.error('Failed to rename playlist folder. Please, report this incident.');
                            }
                        );
                }
            }
        );
    };

    $scope.createNew = () => {
        $scope.editedPlaylist = {$new: true, songs:[],genres:{},filters:[]};
        show('playlistEditor');
    };

    $scope.onFolderUpdated = () => {
        $rootScope.$broadcast('playlist-folder:updated');
    };

    $scope.onNodeToggle = (node, expanded) => {
        if(expanded) {
            let playlists = _.filter(node.children, (child) => child.route === 'playlist' && child.songs_count === undefined && !child.$loading);
            _.each(playlists, (playlist) => playlist.$loading = true);
            let ids = _.map(playlists, (playlist) => playlist.id).join(',');
            if(ids.length > 0) {
                Restangular
                    .all('playlist')
                    .customGET('song-count', {ids: ids})
                    .then(
                        (response) => {
                            _.each(response, (value, key) => {
                                key = key * 1;
                                let playlist = _.find(playlists, (playlist) => playlist.id === key);
                                if(playlist !== undefined) {
                                    playlist.$loading = false;
                                    playlist.songs_count = value;
                                    let label = $scope.labels[playlist.route + playlist.id];
                                    label += ' <b>(' + playlist.songs_count + ')</b>';
                                    $scope.labels[playlist.route + playlist.id] = $sce.trustAsHtml(label);
                                }
                            });
                        }
                    );
            }
        }
    };

    $scope.copyPlaylist = () => {
        let node = $scope.selectedNode;

        $scope.showLoader = true;
        Restangular
            .one('playlist', node.id)
            .get()
            .then(
                (playlist) => {
                    delete playlist.id;
                    playlist.name = playlist.name + COPIED_SUFFIX;
                    Restangular
                        .all('playlist')
                        .post(playlist)
                        .then(
                            () => {
                                $rootScope.$broadcast('playlist:created');
                                Notification.success('Playlist copied.');
                            },
                            () => {
                                Notification.error('Failed to copy playlist. Please, report this incident.');
                            }
                        )
                    $scope.showLoader = false;
                },
                () => $scope.showLoader = false
            );
    };

    $scope.$watch('searchQuery', (newQuery, oldQuery) => {
        if(newQuery !== '' && newQuery !== undefined) {
            let queryRegexp = new RegExp(newQuery, 'i');
            let result = filterTree($scope.originalTree, (node) => queryRegexp.test(node.name));
            _.remove($scope.playlistsTreeExpandedNodes);
            _.each(result['playlist-folder'], (node) => $scope.playlistsTreeExpandedNodes.push(node));
            $scope.playlistsTree = buildTree({
                folders: result['playlist-folder'],
                playlists: result['playlist']
            });
        } else {
            $scope.playlistsTree = $scope.originalTree;
        }
    });

    $scope.$on('playlist-folder:deleted', refreshTree);
    $scope.$on('playlist-folder:created', refreshTree);
    $scope.$on('playlist-folder:updated', refreshTree);

    $scope.$on('playlist:deleted', refreshTree);
    $scope.$on('playlist:created', refreshTree);
    $scope.$on('playlist:updated', refreshTree);

    refreshTree();
    show('welcome');
};

export default PlaylistsController;