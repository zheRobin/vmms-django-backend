/* @ngInject */
function AuthService($q, $rootScope, Restangular, localStorageService)
{
    const HOST = 'music';
    const LS_TOKEN_KEY = 'authToken';
    
    let tryGetToken = () => {
        return localStorageService.get(LS_TOKEN_KEY);
    };

    let storeToken = (token) => {
        localStorageService.set(LS_TOKEN_KEY, token);
    };

    $rootScope.authToken = tryGetToken();

    let user;
    this.checkLogin = () => {
        let deferred = $q.defer();
        if($rootScope.isAuthenticated === undefined) {
            Restangular
                .all('profile')
                .customGET({host: HOST})
                .then(
                    (response) => {
                        if(response.status && response.status === 'error') {
                            deferred.reject();
                        } else {
                            user = response;
                            $rootScope.isAuthenticated = true;
                            $rootScope.currentUser = user;
                            deferred.resolve(user);
                        }
                    },
                    () => deferred.reject()
                )
        } else {
            deferred.resolve($rootScope.currentUser);
        }
        return deferred.promise;
    };
    this.login = (credentials) => {
        let deferred = $q.defer();
        credentials.host = HOST;
        Restangular
            .all('obtain-token')
            .customPOST(credentials)
            .then((response) => {
                if(response.status && response.status === 'error') {
                    deferred.reject(response);
                } else {
                    user = response;
                    storeToken(response.token);
                    $rootScope.authToken = response.token;
                    $rootScope.isAuthenticated = true;
                    $rootScope.currentUser = response.user;
                    deferred.resolve();
                }
            });
        return deferred.promise;
    }
    this.logout = () => {
        let deferred = $q.defer();
        Restangular
            .all('logout')
            .customGET()
            .then(
                (response) => {
                    if(response.status === 'ok') {
                        localStorageService.remove(LS_TOKEN_KEY);
                        $rootScope.isAuthenticated = false;
                        delete $rootScope.currentUser;
                        $rootScope.$broadcast('user:logout');
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                },
                () => deferred.reject()
            );
        return deferred.promise;
    }
};

export default AuthService;