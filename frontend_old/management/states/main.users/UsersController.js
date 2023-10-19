import _ from 'lodash';
import './users.css';


/* @ngInject */
const UsersController = function($rootScope, $scope, Restangular, Notification) {
    let refreshUsers = () => {
        Restangular
            .all('user')
            .getList()
            .then((users) => {
                $scope.users = _.sortBy(users, 'name');
            });
    };

    $scope.onSelection = (user) => {
        $scope.editedModel = Restangular.copy(user);
        $scope.selectedUserId = user.id;
    };

    $scope.createNew = () => {
        $scope.editedModel = {};
        $scope.selectedUserId = null;
    };

    $scope.removeSelected = () => {
        if($scope.selectedUserId && $scope.selectedUserId !== null) {
            let confirmed = confirm(
                "Are you sure you want to delete this user? " +
                "This action is irreversible."
            );
            if(confirmed) {
                $scope
                    .editedModel
                    .remove()
                    .then(() => {
                        $scope.selectedUserId = null;
                        delete $scope.editedModel;
                        Notification.success("User has been deleted.");
                        $rootScope.$broadcast('user:deleted')
                    });
            }
        } else {
            Notification.error('Cannot remove this user.');
        }
    };

    $scope.$on('user:deleted', refreshUsers);
    $scope.$on('user:created', refreshUsers);
    $scope.$on('user:updated', refreshUsers);


    // Initialization
    refreshUsers();
};

UsersController.$inject = ['$rootScope', '$scope', 'Restangular', 'Notification'];

export default UsersController;