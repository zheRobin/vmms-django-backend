import bootbox from 'bootbox';
import { buildProgramPlaylistsFolderedTree, traverseTree, restangularFix, findNode, filterTree } from '../../../util.js';


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
const ProgramsController =
function($q, $rootScope, $sce, $scope, Restangular, Notification) {
    let buildTree = (entities) => {
        return _.orderBy(
            buildProgramPlaylistsFolderedTree(
                _.sortBy(entities.folders, 'name'),
                _.sortBy(entities.programs, 'name'),
                _.sortBy(entities.playlists, 'name')
            ), (folder) => folder.name.toLowerCase()
        );
    };

    let refreshTree = () => {
        $q.all([
            Restangular
                .all('program-folder')
                .getList(),
            Restangular
                .all('program')
                .getList(),
            Restangular
                .all('playlist')
                .getList()
        ]).then((results) => {
            $scope.programsTree = buildTree({
                folders: results[0],
                programs: results[1],
                playlists: results[2]
            });
            $scope.originalTree = angular.copy($scope.programsTree);
            $scope.labels = _.reduce(
                _.map(results[1], (program) => {
                    program.prefix = _.map(
                        program.prefix.split(' '),
                        (prefix) => {
                            return ('<div class="ttip">' + prefix +  
                                       '<span class="ttiptext">' + PREFIX_TOOLTIPS[prefix] + '</span>' +
                                    '</div>')
                        }
                    ).join(' ');
                    return program;
                }), 
                (acc, program) => {
                    acc[program.route + program.id] = $sce.trustAsHtml(program.prefix + ' ' + program.name);
                    if(program.songs_count) {
                        acc[program.route + program.id] += ' <b>(' + program.songs_count + ')</b>';
                        acc[program.route + program.id] = $sce.trustAsHtml(acc[program.route + program.id]);
                    }
                    return acc;
                },
                {}
            );
            _.each(results[0], (programFolder) => {
                $scope.labels[programFolder.route + programFolder.id] = $sce.trustAsHtml(programFolder.name);
            });
            let playlistLabels = _.reduce(
                _.map(results[2], (playlist) => {
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
                }, {}
            );
            $scope.labels = _.merge(playlistLabels, $scope.labels);
        });
    };

    $scope.createNewFolder = () => {
        bootbox.prompt(
            "Enter new program folder name",
            (name) => {
                let folder = { name: name };
                Restangular
                    .all('program-folder')
                    .post(folder)
                    .then(() => {
                        Notification.success('New program folder created.');
                        $rootScope.$broadcast('program-folder:created');
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
                                Notification.success('Program folder renamed');
                                $rootScope.$broadcast('program-folder:updated');
                            },
                            () => {
                                Notification.error('Failed to rename program folder. Please, report this incident.');
                            }
                        );   
                }
            }
        );
    };

    $scope.onNodeToggle = (node, expanded) => {
        if(expanded) {
            if(node.route === 'program-folder') {
                let programs = _.filter(node.children, (child) => child.route === 'program' && child.songs_count === undefined && !child.$loading);
                _.each(programs, (program) => program.$loading = true);
                let ids = _.map(programs, (program) => program.id).join(',');
                if(ids.length > 0) {
                    Restangular
                        .all('program')
                        .customGET('song-count', {ids: ids})
                        .then(
                            (response) => {
                                _.each(response, (value, key) => {
                                    key = key * 1;
                                    let program = _.find(programs, (program) => program.id === key);
                                    if(program !== undefined) {
                                        program.$loading = false;
                                        program.songs_count = value;
                                        let label = $scope.labels[program.route + program.id];
                                        label += ' <b>(' + program.songs_count + ')</b>';
                                        $scope.labels[program.route + program.id] = $sce.trustAsHtml(label);
                                    }
                                });
                            }
                        );
                }
            } else if(node.route === 'program') {
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
        }
    };

    $scope.createNew = () => {
        $scope.showProgram = true;
        $scope.showPlaylist = false;
        $scope.editedProgram = {};  
    };

    $scope.showLoader = false;

    $scope.onSelection = (node, selected) => {
        if(selected) {
            $scope.selectedNode = node;
            if(node.route === 'program') {
                $scope.showProgram = true;
                $scope.showPlaylist = false;

                $scope.showLoader = true;
                Restangular
                    .one('program', node.id)
                    .get()
                    .then(
                        (program) => {
                            $scope.editedProgram = program;
                            $scope.showLoader = false;
                        },
                        () => $scope.showLoader = false
                    );
            }
            if(node.route === 'playlist') {
                $scope.showPlaylist = true;
                $scope.showProgram = false;
             
                $scope.showLoader = true;
                Restangular
                    .one('playlist', node.id)
                    .get()
                    .then(
                        (playlist) => {
                            $scope.editedPlaylist = playlist;
                            $scope.showLoader = false;
                        },
                        () => $scope.showLoader = false
                    );
            }
        } else {
            $scope.selectedNode = null;
        }
    };
    
    $scope.removeSelected = () => {
        let objName = $scope.selectedNode.route === 'program' ? 'program' : 'program folder';
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
                    "This " + objName + " contains programs. " + 
                    "Deleting it will also remove ALL the programs in it. " + 
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
                        if(objName === 'program') {
                            $rootScope.$broadcast('program:deleted')
                            delete $scope.editedProgram;
                        } else {
                            $rootScope.$broadcast('program-folder:deleted')
                        }
                    });
            }
        } else {
            Notification.error('Cannot remove this ' + objName + '.');
        }
    };

    $scope.copyProgram = () => {
        let node = $scope.selectedNode;
        
        $scope.showLoader = true;
        Restangular
            .one('program', node.id)
            .get()
            .then(
                (program) => {
                    delete program.id;
                    program.name = program.name + COPIED_SUFFIX;
                    Restangular
                        .all('program')
                        .post(program)
                        .then(
                            () => {
                                $rootScope.$broadcast('program:created');
                                Notification.success('Program copied.');
                            },
                            () => {
                                Notification.error('Failed to copy program. Please, report this incident.');
                            }
                        )
                    $scope.showLoader = false;
                },
                () => $scope.showLoader = false
            );
    };

    $scope.onFolderUpdated = () => {
        $rootScope.$broadcast('program-folder:updated');
    };

    $scope.$watch('searchQuery', (newQuery, oldQuery) => {
        if(newQuery !== '' && newQuery !== undefined) {
            let queryRegexp = new RegExp(newQuery, 'i');
            let result = filterTree(
                $scope.originalTree, 
                (node) => queryRegexp.test(node.name),
                (tree, node) => {
                    if(node.route === 'playlist') {
                        return findNode(tree, (nd) => {
                            if(nd.route === 'program') {
                                let found = false;
                                _.each(nd.playlists, (pl) => {
                                    if(pl.playlist === node.id) {
                                        found = true;
                                        return false;
                                    }
                                });
                                if(found) {
                                    return true;
                                }
                            }
                        });
                    } else if(node.route === 'program' || node.route === 'program-folder') {
                        return findNode(tree, (n) => n.id === node.parent);
                    }
                });
            _.remove($scope.programsTreeExpandedNodes);
            _.each(result['program-folder'], (node) => $scope.programsTreeExpandedNodes.push(node));
            _.each(result['program'], (node) => {
                if(node.children && node.children.length > 0) {
                    $scope.programsTreeExpandedNodes.push(node);
                }
            });
            $scope.programsTree = buildTree({
                folders: result['program-folder'],
                programs: result['program'],
                playlists: result['playlist']
            });
        } else {
            $scope.programsTree = $scope.originalTree;
        }
    });

    $scope.$on('program-folder:deleted', refreshTree);
    $scope.$on('program-folder:created', refreshTree);
    $scope.$on('program-folder:updated', refreshTree);
    $scope.$on('program:deleted', refreshTree);
    $scope.$on('program:created', refreshTree);
    $scope.$on('program:updated', refreshTree);
    $scope.$on('playlist:deleted', refreshTree);
    $scope.$on('playlist:created', refreshTree);
    $scope.$on('playlist:updated', refreshTree);

    refreshTree();
};

export default ProgramsController;
