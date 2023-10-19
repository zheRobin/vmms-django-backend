import template from './preview-link-editor.jade';
import controller from './previewLinkEditorController.js';


export default function PreviewLinkEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            link: '=model'
        }
    };
};