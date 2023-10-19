/* @ngInject */
const LoginController = function($scope, $state, AuthService)
{
    $scope.credentials = {};
    $scope.login = () => {
        AuthService
            .login($scope.credentials)
            .then(
                () => $state.go('main.dashboard'),
                (response) => {
                    $scope.msg = response.msg;
                }
            )
    };
};

export default LoginController;
