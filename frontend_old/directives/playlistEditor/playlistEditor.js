import './playlist-editor.css';
import template from './playlist-editor.jade';
import controller from './playlistEditorController.js';


export default function PlaylistEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            playlist: '=model'
        }
    };
};