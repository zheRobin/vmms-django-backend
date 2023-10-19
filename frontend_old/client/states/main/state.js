import template from './main.jade';
import controller from './MainController.js';


const state = {
    name: 'main',
    data: {
        controller: controller,
        template: template
    }
};

export default state;