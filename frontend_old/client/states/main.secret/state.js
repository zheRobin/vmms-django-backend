import './secret.css';
import template from './secret.jade';
import controller from './SecretController.js';


const state = {
    name: 'main.secret',
    data: {
        url: '/secret/:loginKey',
        controller: controller,
        template: template
    }
};

export default state;
