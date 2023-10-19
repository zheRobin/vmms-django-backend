import template from './dashboard.jade';
import controller from './DashboardController.js';


const state = {
    name: 'main.dashboard',
    data: {
        url: '/dashboard',
        controller: controller,
        template: template
    }
};

export default state;
