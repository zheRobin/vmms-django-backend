import _ from 'lodash';
import bootbox from 'bootbox';
import 'angular-tree-control/css/tree-control.css';
import './clients.css';
import { 
    buildFolderedTree,
    restangularFix,
    traverseTree,
    findNode,
    filterTree
} from '../../../util.js';



/* @ngInject */ 
const ClientsController = 
function($q, $rootScope, $scope, Restangular, Notification) {
    let buildTree = (entities) => {
        return _.orderBy(
            buildFolderedTree(
                _.sortBy(entities.folders, 'name'),
                _.sortBy(entities.clients, 'name')
            ), (folder) => folder.name.toLowerCase()
        );
    };

    let refreshClients = () => {
        console.log('only clients with content', $scope.onlyClientsWithContent);
        $q.all([
            Restangular
                .all('client-folder')
                .getList(),
            Restangular
                .all('client')
                .getList({ onlyClientsWithContent: $scope.onlyClientsWithContent })
        ]).then((results) => {
            $scope.folders = _.orderBy(results[0], (folder) => folder.name.toLowerCase());
            $scope.clientsTree = buildTree({
                folders: results[0],
                clients: results[1]
            });
            $scope.originalTree = angular.copy($scope.clientsTree);
        })
    };

    let loadClient = (shallowClient) => {
        let deferred = $q.defer();
        $scope.showLoader = true;
        Restangular
            .one('client', shallowClient.id)
            .get()
            .then(
                (client) => {
                    deferred.resolve(client);
                    $scope.showLoader = false;
                },
                () => {
                    Notification.error('Failed to load client. Please report this incident.');
                    deferred.reject();
                    $scope.showLoader = false;
                }
            );
        return deferred.promise;
    };

    $scope.copyClient = () => {
        let copyingFailedCallback = () => {
            Notification.error('Failed to copy client. Please, report this incident.');
        }
        bootbox.confirm(
            "Would you like to also copy scheduled events for the client?",
            (confirmationResult) => {
                let copyEvents = confirmationResult;
                let client = $scope.selectedNode;
                Restangular
                    .one('client', client.id)
                    .customPOST({}, 'copy', { 'with_events': confirmationResult })
                    .then(
                        () => {
                            $rootScope.$broadcast('client:created');
                            Notification.success('Client copied.');
                        },
                        copyingFailedCallback
                    )
            }
        )
    }

    $scope.clientsTree = [];
    $scope.treeOptions = {};
    $scope.onSelection = (node, selected) => {
        if(node.route === 'client') {
            loadClient(node)
                .then((client) => $scope.editedModel = client);
        }
    };

    $scope.getNodeLabel = (node) => {
        if(node && node.filters && node.filters.length > 0) {
            return '🎱 ' + node.name;
        } else {
            return node.name;
        }
    }
    $scope.createNew = () => {
        $scope.selectedNode = null;
        $scope.editedModel = {};
    };

    $scope.createNewFolder = () => {
        bootbox.prompt(
            "Enter new client folder name",
            (name) => {
                let folder = { name: name };
                Restangular
                    .all('client-folder')
                    .post(folder)
                    .then(() => {
                        Notification.success('New client folder created.');
                        $rootScope.$broadcast('client-folder:created');
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
                    console.log(name);
                    folder.name = name;
                    folder = restangularFix(Restangular, folder);
                    folder
                        .put()
                        .then(
                            () => {
                                Notification.success('Client folder renamed');
                                $rootScope.$broadcast('client-folder:updated');
                            },
                            () => {
                                Notification.error('Failed to rename client folder. Please, report this incident.');
                            }
                        );
                }
            }
        );
    };

    $scope.removeSelected = () => {
        let objName = $scope.selectedNode.route === 'client' ? 'client' : 'client folder';
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
                    "This " + objName + " contains clients. " + 
                    "Deleting it will also remove ALL the clients in it. " + 
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
                        if(objName === 'client') {
                            $rootScope.$broadcast('client:deleted')
                            delete $scope.editedModel;
                        } else {
                            $rootScope.$broadcast('client-folder:deleted')
                        }
                    });
            }
        } else {
            Notification.error('Cannot remove this ' + objName + '.');
        }
    };

    $scope.onFolderUpdated = () => {
        $rootScope.$broadcast('client-folder:updated');
    };

    $scope.sendSyncRequest = () => {
        let confirmed = confirm("Are you sure that you want to sync client and player data?");
        if(confirmed) {
            Notification.info('Contacting monitoring...');
            Restangular
                .all('client')
                .customGET('sync')
                .then(
                    () => {
                        Notification.success('Sync request sent. It might take some time for the process to complete.');
                    },
                    () => {
                        Notification.error('Unexpected error. Please, report this incident.');
                    }
                );
        }
    }

    $scope.$on('client:deleted', refreshClients);
    $scope.$on('client:created', refreshClients);
    $scope.$on('client:updated', refreshClients);
    $scope.$on('client-folder:deleted', refreshClients);
    $scope.$on('client-folder:created', refreshClients);
    $scope.$on('client-folder:updated', refreshClients);
    $scope.$watch('onlyClientsWithContent', (value) => {
        if(value !== undefined) {
            refreshClients();
        }
    });

    $scope.$watch('searchQuery', (newQuery, oldQuery) => {
        if(newQuery !== '' && newQuery !== undefined) {
            let queryRegexp = new RegExp(newQuery, 'i');
            let result = filterTree($scope.originalTree, (node) => queryRegexp.test(node.name));
            _.remove($scope.clientsTreeExpandedNodes);
            _.each(result['client-folder'], (node) => $scope.clientsTreeExpandedNodes.push(node));
            $scope.clientsTree = buildTree({
                folders: result['client-folder'],
                clients: result['client']
            });
        } else {
            $scope.clientsTree = $scope.originalTree;
        }
    });

    // Initialization
    refreshClients();
};

export default ClientsController;