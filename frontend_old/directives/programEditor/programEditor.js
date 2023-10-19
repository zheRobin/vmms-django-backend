import template from './programEditor.jade';
import controller from './ProgramEditorController.js';


export default function ProgramEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            program: '=model'
        }
    };
};
