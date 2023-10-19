import template from './workingTimeEditor.jade';
import controller from './WorkingTimeEditorController.js';


export default function WorkingTimeEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            openTime: '=',
            closeTime: '=',
            enabled: '=',
        }
    };
};
