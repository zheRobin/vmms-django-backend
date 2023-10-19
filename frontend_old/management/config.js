import _ from 'lodash';
import States from './states.js';


const Config =
/* @ngInject */
($stateProvider, $urlRouterProvider, RestangularProvider) => {
    $urlRouterProvider.otherwise('/dashboard');

    _.each(States, (state) => $stateProvider.state(state.name, state.data));

    let noSubdomainHost = _.slice(location.host.split('.'), 1).join('.');
    RestangularProvider.setBaseUrl(location.protocol + '//' + 'api.' + noSubdomainHost + '/api/v1');
    RestangularProvider.setRequestSuffix('/');

    let $cookies;
    angular.injector(['ngCookies']).invoke(['$cookies', (_$cookies) => {
        $cookies = _$cookies;
    }]);
    RestangularProvider.setDefaultHttpFields({withCredentials: true});
}

export default Config;