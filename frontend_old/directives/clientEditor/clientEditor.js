import template from './client-editor.jade';
import controller from './clientEditorController.js';


export default function ClientEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            client: '=model'
        }
    };
};