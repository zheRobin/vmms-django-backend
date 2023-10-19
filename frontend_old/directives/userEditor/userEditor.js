import template from './user-editor.jade';
import controller from './userEditorController.js';


export default function UserEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            user: '=model'
        }
    };
};