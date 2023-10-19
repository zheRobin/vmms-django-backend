import template from './link-edit.jade';
import controller from './LinkPreviewEditController.js';


const state = {
    name: 'main.link-preview-edit',
    data: {
        url: '/link-preview/:id',
        controller: controller,
        template: template
    }
};

export default state;
