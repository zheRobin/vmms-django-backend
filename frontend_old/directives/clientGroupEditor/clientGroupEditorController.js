import _ from 'lodash';


/* @ngInject */
const ClientGroupEditorController =
function($rootScope, $scope, Restangular, Notification) {
    let originalGroup;
    let preProcess = (group) => {
        return group;
    };

    let postProcess = (group) => {
        return group;
    };

    let validate = (group, isNew) => {
        let errors = [];
        return errors;
    };

    $scope.addClient = () => {
        if($scope.group.clients)
            $scope.group.clients.push({$empty: true});
        else
            $scope.group.clients = [{$empty: true}];
    };
    $scope.removeClientAt = (index) => {
        $scope.group.clients.splice(index, 1);
    }

    $scope.isNew = true;
    $scope.save = () => {
        let errors = validate($scope.group, $scope.isNew);
        if(errors.length > 0) {
            Notification.error('Cannot save group:<br>' + errors.join('<br>'));
            return;
        }
        let errorHandler = (response) => {
            if(typeof response.data === 'object') {
                let errors = response.data;
                errors = _.map(errors, (err) => err);
                Notification.error('Cannot save group:<br>' + errors.join('<br>'));
            } else {
                Notification.error('Unexpected error occured. Please, report this incident.')
            }
        };
        let toSend = postProcess($scope.group);

        if($scope.isNew) {
            Restangular
                .all('client-group')
                .post(toSend)
                .then(
                    (group) => {
                        Notification.success(
                            'New group has been created.'
                        );
                        originalGroup = Restangular.copy(group);
                        $scope.group = group;
                        $rootScope.$broadcast('client-group:created');
                    },
                    errorHandler
                );
        } else {
            toSend
                .put()
                .then(
                    () => {
                        Notification.success(
                            'Group has been updated'
                        );
                        $scope.group = preProcess(toSend);
                        originalGroup = Restangular.copy($scope.group);
                        $rootScope.$broadcast('client-group:updated');
                    },
                    errorHandler
                );
        }
    };
    $scope.reset = () => {
        $scope.group = Restangular.copy(originalGroup);        
    };

    $scope.$watch('group', (newGroup) => {
        if(newGroup !== undefined && !newGroup.$processed) {
            $scope.isNew = newGroup.id === undefined;
            $scope.group = preProcess(newGroup);
            originalGroup = Restangular.copy(newGroup);
        }
    });
};

export default ClientGroupEditorController;