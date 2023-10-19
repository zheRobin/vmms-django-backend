import _ from 'lodash';


/* @ngInject */
const ClientEditorController =
function($rootScope, $scope, Restangular, Notification) {
    const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const CLIENT_CONTENTS_COUNT = 7;
    const DEFAULT_PARENTS = [
        {
            name: 'Root'
        }
    ];

    let originalClient;
    let parseTimeString = (timeStr) => {
        if(timeStr != null) {
            let data = timeStr.split(':');
            let hours = parseInt(data[0]);
            let minutes = parseInt(data[1]);
            let seconds = parseInt(data[2]);
            let result = new Date();
            result.setHours(hours, minutes, seconds);
            return result;
        } else {
            return null;
        }
    };

    let preProcess = (client) => {
        let processed = Restangular.copy(client);
        processed.$processed = true;
        if(processed.parent === null) {
            delete processed.parent;
        }
        let toAdd = CLIENT_CONTENTS_COUNT;
        if(processed.contents !== undefined) {
            toAdd -= processed.contents.length;
            processed.contents = _.map(processed.contents, (c) => { 
                if (c.content.object.route === undefined) {
                    c.content.object.route = c.content.type;
                }
                return { value: c.content.object }
            });
        } else {
            processed.contents = [];
        }
        _.each(DAYS, (day) => {
            processed[day + '_open'] = parseTimeString(processed[day + '_open']);
            processed[day + '_close'] = parseTimeString(processed[day + '_close']);
        });
        _.times(toAdd, () => {
            processed.contents.push({ value: { $empty: true } })
        });
        return processed;
    };

    let postProcess = (client) => {
        let processed = Restangular.copy(client);
        processed.contents = _.map(processed.contents, (c) => { return {content: c.value}; });
        processed.contents = _.filter(processed.contents, (c) => c.content !== undefined); 
        
        let openTime, closeTime;
        _.each(DAYS, (day) => {
            if(processed[day + '_enabled']) {
                openTime = processed[day + '_open'];
                closeTime = processed[day + '_close'];

                if(openTime !== null) {
                    processed[day + '_open'] = openTime.getHours() + ':' + openTime.getMinutes() + ":00";
                }
                if(closeTime !== null) {
                    processed[day + '_close'] = closeTime.getHours() + ':' + closeTime.getMinutes() + ":00";
                }
            } else {
                processed[day + '_open'] = null;
                processed[day + '_close'] = null;
            }
        });

        if(processed.parent === undefined) {
            processed.parent = null;
        }
        return processed;
    };

    let validate = (client, isNew) => {
        let errors = [];
        if(client.name === undefined || client.name === '') {
            errors.push('Client name cannot be empty');
        }
        if(client.basic_content === undefined) {
            errors.push('Client basic content cannot be empty.');
        }
        return errors;
    };
    let refreshClientFolders = () => {
        Restangular
            .all('client-folder')
            .getList()
            .then((folders) => $scope.parents = _.orderBy(folders, (folder) => folder.name.toLowerCase()));
    };

    $scope.parents = DEFAULT_PARENTS;

    $scope.isNew = true;
    $scope.save = () => {
        let errors = validate($scope.client, $scope.isNew);
        if(errors.length > 0) {
            Notification.error('Cannot save client:<br>' + errors.join('<br>'));
            return;
        }
        let errorHandler = (response) => {
            if(typeof response.data === 'object') {
                let errors = response.data;
                errors = _.map(errors, (err) => err);
                Notification.error('Cannot save client:<br>' + errors.join('<br>'));
            } else {
                Notification.error('Unexpected error occured. Please, report this incident.')
            }
        };
        let toSend = postProcess($scope.client);

        if($scope.isNew) {
            Restangular
                .all('client')
                .post(toSend)
                .then(
                    (client) => {
                        Notification.success(
                            'New client has been created.'
                        );
                        originalClient = Restangular.copy(client);
                        $scope.client = client;
                        $rootScope.$broadcast('client:created');
                    },
                    errorHandler
                );
        } else {
            toSend
                .put()
                .then(
                    () => {
                        Notification.success(
                            'Client has been updated'
                        );
                        $scope.client = preProcess(toSend);
                        originalClient = Restangular.copy($scope.client);
                        $rootScope.$broadcast('client:updated');
                    },
                    errorHandler
                );
        }
    };
    $scope.reset = () => {
        $scope.client = Restangular.copy(originalClient);        
    };

    $scope.resetApiKey = () => {
        let confirmed = confirm(
            'This will invalidate the current API key and issue a new one. ' +
            'Applications using old API key will NOT work until the receive the new key. ' +
            'This action is irreversible. ' + 
            'Are you sure you want to continue? '
        );
        if(confirmed) {
            $scope
                .client
                .customPUT(null, 'reset-api-key')
                .then((client) => {
                    $scope.client = client;
                    $rootScope.$broadcast('client:updated');
                });
        }
    };

    $scope.resetLoginKey = () => {
        let confirmed = confirm(
            'This will revoke current secret login key and issue a new one. ' +
            'Old secret login link will no longer work. ' +
            'This action is irreversible. ' + 
            'Are you sure you want to continue? '
        );
        if(confirmed) {
            $scope
                .client
                .customPUT(null, 'reset-login-key')
                .then((client) => {
                    $scope.client = client;
                    $rootScope.$broadcast('client:updated');
                });
        }  
    }

    $scope.$watch('workingHoursEnabled', (enabled) => {
        if(!enabled) {
            if($scope.client !== undefined) {
                _.each(DAYS, (day) => {
                    $scope.client[day + '_enabled'] = false;
                });
            }
        }
    });

    $scope.$watch('client', (newClient) => {
        if(newClient !== undefined && !newClient.$processed) {
            $scope.isNew = newClient.id === undefined;
            $scope.client = preProcess(newClient);
            let whEnabled = false;
            _.each(DAYS, (day) => {
                if($scope.client[day + '_enabled']) {
                    whEnabled = true;
                    return false;
                }
            });
            $scope.workingHoursEnabled = whEnabled;
            originalClient = Restangular.copy(newClient);
        }
    });

    $scope.$on('client-folder:deleted', refreshClientFolders);
    $scope.$on('client-folder:created', refreshClientFolders);
    $scope.$on('client-folder:updated', refreshClientFolders);

    refreshClientFolders();
};

export default ClientEditorController;