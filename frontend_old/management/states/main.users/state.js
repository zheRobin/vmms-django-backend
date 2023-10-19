import template from './users.jade';
import controller from './UsersController.js';


const state = {
    name: 'main.users',
    data: {
        authorization: {
            disallow: ['user']
        },
        url: '/users',
        controller: controller,
        template: template
    },
};

export default state;