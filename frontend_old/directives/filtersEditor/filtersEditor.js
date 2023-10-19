import './filters-editor.css';
import template from './filters-editor.jade';
import controller from './filtersEditorController.js';


export default function FiltersEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            model: '=model'
        }
    };
};