import './playlistAutocomplete.css';
import template from './playlistAutocomplete.jade';
import controller from './PlaylistAutocompleteController.js';


export default function PlaylistAutocomplete() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        link: function(scope, element, attrs) {
            scope.excludeManual = attrs.excludeManual === "";
            scope.limit = attrs.limit !== undefined ? parseInt(attrs.limit) : 3; 
        },
        scope: {
            model: '='
        }
    };
};
