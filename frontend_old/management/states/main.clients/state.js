import template from './clients.jade';
import controller from './ClientsController.js';


const state = {
    name: 'main.clients',
    data: {
        url: '/clients',
        controller: controller,
        template: template
    }
};

export default state;