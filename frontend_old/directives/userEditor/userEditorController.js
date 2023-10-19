/* @ngInject */
const UserEditorController =
function($rootScope, $scope, Restangular, Notification) {
    const GROUPS = ['Superuser', 'Admin', 'User'];

    let originalUser;
    let validate = (user, isNew) => {
        let errors = [];
        if(user.username === '' || user.username === undefined) {
            errors.push('Username cannot be empty.');
        }
        if(isNew && (user.password === '' || user.password === undefined)) {
            errors.push('Password cannot be empty.');
        }
        if(user.group === '' || user.group === undefined) {
            errors.push('Please, select user group.');
        }
        return errors;
    };

    $scope.userGroups = GROUPS;

    $scope.isNew = true;
    $scope.save = () => {
        let errors = validate($scope.user, $scope.isNew);
        if(errors.length > 0) {
            Notification.error('Cannot save user:<br>' + errors.join('<br>'));
            return;
        }
        let errorHandler = (response) => {
            if(typeof response.data === 'object') {
                let errors = response.data;
                errors = _.map(errors, (err) => err);
                Notification.error('Cannot save user:<br>' + errors.join('<br>'));
            } else {
                Notification.error('Unexpected error occured. Please, report this incident.')
            }
        };
        if($scope.isNew) {
            Restangular
                .all('user')
                .post($scope.user)
                .then(
                    (user) => {
                        Notification.success(
                            'New user has been created.'
                        );
                        originalUser = Restangular.copy(user);
                        $scope.user = user;
                        $rootScope.$broadcast('user:created');
                    },
                    errorHandler
                );
        } else {
            $scope
                .user
                .put()
                .then(
                    () => {
                        originalUser = Restangular.copy($scope.user);
                        Notification.success(
                            'User has been updated'
                        );
                        $rootScope.$broadcast('user:updated');
                    },
                    errorHandler
                );
        }
    };
    $scope.reset = () => {
        $scope.user = Restangular.copy(originalUser);        
    };

    $scope.$watch('user', (newClient) => {
        if(newClient !== undefined) {
            $scope.isNew = newClient.id === undefined;
            if(newClient.parent === null) {
                delete newClient.parent;
            }
            originalUser = Restangular.copy(newClient);
        }
    });
};

export default UserEditorController;