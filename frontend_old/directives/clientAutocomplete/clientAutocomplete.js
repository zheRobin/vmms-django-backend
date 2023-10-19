import template from './clientAutocomplete.jade';
import controller from './ClientAutocompleteController.js';


export default function ClientAutocomplete() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        link: function(scope, element, attrs) {
            scope.limit = attrs.limit !== undefined ? parseInt(attrs.limit) : 3; 
            scope.readonly = attrs.readonly !== undefined;
        },
        scope: {
            model: '='
        }
    };
};
