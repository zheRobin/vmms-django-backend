import './master-schedule.css';
import template from './master-schedule.jade';
import controller from './MasterScheduleController.js';


const state = {
    name: 'main.master-schedule',
    data: {
        url: '/master-schedule',
        controller: controller,
        template: template
    }
};

export default state;