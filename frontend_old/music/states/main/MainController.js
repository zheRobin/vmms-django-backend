/* @ngInject */
const MainController = 
function($scope, $state, AuthService) {
    $scope.logout = () => {
        AuthService
            .logout()
            .then(
                () => $state.go('login')
            );
    };
};

export default MainController;