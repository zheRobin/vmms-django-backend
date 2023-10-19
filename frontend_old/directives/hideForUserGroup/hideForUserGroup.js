import _ from 'lodash';


/* @ngInject */
export default function hideForUserGroup($rootScope) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attr) {
            $rootScope.$watch('currentUser', (user) => {
                if(user !== undefined) {
                    if(attr.hideForUserGroup === _.toLower(user.group)) {
                        element.addClass('hidden');
                    } else {
                        element.removeClass('hidden');
                    }
                } else {
                    element.addClass('hidden');
                }
            })
        }
    };
};
