import template from './client-group-editor.jade';
import controller from './clientGroupEditorController.js';


export default function ClientGroupEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            group: '=model'
        }
    };
};