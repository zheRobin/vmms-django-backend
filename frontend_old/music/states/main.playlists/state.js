import './playlists.css';
import template from './playlists.jade';
import controller from './PlaylistsController.js';


const state = {
    name: 'main.playlists',
    data: {
        url: '/playlists',
        controller: controller,
        template: template
    }
};

export default state;