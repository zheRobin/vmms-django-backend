import template from './link-create.jade';
import controller from './LinkPreviewNewController.js';


const state = {
    name: 'main.link-create',
    data: {
        url: '/link-preview/new',
        controller: controller,
        template: template
    }
};

export default state;
