import template from './folderEditor.jade';
import controller from './FolderEditorController.js';


export default function FolderEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            folder: '=model',
            parents: '=',
            onSave: '&'
        }
    };
};
