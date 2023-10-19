import template from './songsPreview.jade';
import controller from './SongsPreviewController.js';
import styles from './songsPreview.css';


export default function SongsPreview() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            songs: '=',
            showLoading: '=',
            totalSongs: '=',
            paramsChange: '&',
            params: '='
        }
    };
};
