import './programs.css';
import template from './programs.jade';
import controller from './ProgramsController.js';


const state = {
    name: 'main.programs',
    data: {
        url: '/programs',
        controller: controller,
        template: template
    }
};

export default state;
