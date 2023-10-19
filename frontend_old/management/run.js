import _ from 'lodash';


/* @ngInject */
export default function($rootScope, $state, Restangular, AuthService, Notification)
{
    Restangular.addFullRequestInterceptor((element, operation, what, url, headers, params) => {
        if($rootScope.authToken) {
            return {
                headers: {
                    'Authorization': 'Token ' + $rootScope.authToken
                }
            };
        } else {
            return {};
        }
    });
    let authorizationFunc = (user, toState) => {
        // if the state contains any authorization info
        if(toState.authorization) {
            if(toState.authorization.disallow) {
                if(_.includes(toState.authorization.disallow, _.toLower(user.group))) {
                    // if user's group is in "disallow" property
                    // disallow
                    return false;
                }
                // all checks passed, allow
                return true;
            } else {
                // state has no info about disallowing anything
                return true
            }
        // if it doesn't, allow
        } else {
            return true;
        }
    };
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        if (toState.name !== 'login') {
            AuthService
                .checkLogin()
                .then(
                    (user) => {
                        if(!authorizationFunc(user, toState)) {
                            Notification.error('You have insufficient access rights to visit this page.');
                            $state.go('main.dashboard');
                        }
                    },
                    () => $state.go('login')
                );
        }
    });
};