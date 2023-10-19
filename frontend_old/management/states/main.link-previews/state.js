import template from './links.jade';
import controller from './LinkPreviewsController.js';


const state = {
    name: 'main.link-previews',
    data: {
        url: '/link-previews',
        controller: controller,
        template: template
    }
};

export default state;
