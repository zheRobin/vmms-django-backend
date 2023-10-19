import './login.css';
import template from './login.jade';
import controller from './LoginController.js';


const state = {
    name: 'login',
    data: {
        url: '/login',
        controller: controller,
        template: template
    }
};

export default state;
