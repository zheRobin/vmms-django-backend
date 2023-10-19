import template from './programPlaylistsEditor.jade';
import controller from './ProgramPlaylistsEditorController.js';


export default function ProgramPlaylistsEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            pplaylists: '=model'
        }
    };
};
