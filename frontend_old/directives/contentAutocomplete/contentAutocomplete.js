import './contentAutocomplete.css';
import template from './contentAutocomplete.jade';
import controller from './ContentAutocompleteController.js';


export default function ContentAutocomplete() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        link: function(scope, element, attrs) {
            scope.limit = attrs.limit !== undefined ? parseInt(attrs.limit) : 3; 
            scope.readonly = attrs.readonly !== undefined;
            scope.programsOnly = attrs.programsOnly !== undefined;
        },
        scope: {
            model: '='
        }
    };
};
