import './genre-selector.css';
import template from './genre-selector.jade';
import controller from './genreSelectorController.js';


export default function GenreSelector() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            model: '='
        }
    };
};