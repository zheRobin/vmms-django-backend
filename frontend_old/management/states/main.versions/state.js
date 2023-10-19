import template from './versions.jade';
import controller from './VersionsController.js';


const state = {
    name: 'main.versions',
    data: {
        authorization: {
            disallow: ['user']
        },
        url: '/versions',
        controller: controller,
        template: template
    },
};

export default state;
