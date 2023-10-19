import template from './versionEditor.jade';
import controller from './VersionEditorController.js';


export default function VersionEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            version: '=model'
        }
    };
};
