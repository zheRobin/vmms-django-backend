import template from './eventEditor.jade';
import controller from './EventEditorController.js';


export default function EventEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            event: '=model',
            client: '=',
            clientGroup: '='
        }
    };
};
