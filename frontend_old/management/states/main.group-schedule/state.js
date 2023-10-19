import './group-schedule.css';
import template from './group-schedule.jade';
import controller from './GroupScheduleController.js';


const state = {
    name: 'main.group-schedule',
    data: {
        url: '/group-schedule',
        controller: controller,
        template: template
    }
};

export default state;