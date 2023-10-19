import template from './songAutocomplete.jade';
import controller from './SongAutocompleteController.js';


export default function SongAutocomplete() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            onSelect: '&'
        }
    };
};
