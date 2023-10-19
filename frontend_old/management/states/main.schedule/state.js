import './schedule.css';
import template from './schedule.jade';
import controller from './ScheduleController.js';


const state = {
    name: 'main.schedule',
    data: {
        url: '/schedule',
        controller: controller,
        template: template
    }
};

export default state;