import 'jquery';
import 'lodash';
import moment from 'moment';
import 'moment-timezone';

moment.locale('de', {
    longDateFormat : {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "MM/DD/YYYY",
        LL: "MMMM Do YYYY",
        LLL: "MMMM Do YYYY LT",
        LLLL: "dddd, MMMM Do YYYY LT"
    }
});

window.moment = moment;

import 'masonry-layout';
import 'bootstrap-webpack';
import 'bootbox';
import 'fullcalendar/dist/fullcalendar.js';
import 'fullcalendar/dist/fullcalendar.css';
import 'angular';
import 'angularjs-slider/dist/rzslider.js';
import 'angularjs-slider/dist/rzslider.css';
let abdtpicker = require('angular-bootstrap-datetimepicker');
require('angular-bootstrap-datetimepicker/src/css/datetimepicker.css');
import 'angular-cookies';
import 'angular-drag-and-drop-lists';
import 'angular-local-storage';
import 'angular-moment';
import 'angular-ui-bootstrap';
import 'angular-ui-router';
import 'angular-ui-calendar';
import 'angular-ui-notification/dist/angular-ui-notification.js';
import 'angular-ui-notification/dist/angular-ui-notification.css';
import 'angular-tree-control';
import 'angular-tree-control/css/tree-control.css';
import 'ng-masonry';
import 'ng-tags-input/build/ng-tags-input.js';
import 'ng-tags-input/build/ng-tags-input.css';
import 'ng-tags-input/build/ng-tags-input.bootstrap.css';
import 'restangular';
import 'ngjs-color-picker';
import 'ng-file-upload';

import '../assets/styles/global.css';

import genreSelector from '../directives/genreSelector/genreSelector.js';
import filtersEditor from '../directives/filtersEditor/filtersEditor.js';
import clientEditor from '../directives/clientEditor/clientEditor.js';
import clientGroupEditor from '../directives/clientGroupEditor/clientGroupEditor.js';
import clientAutocomplete from '../directives/clientAutocomplete/clientAutocomplete.js';
import playlistEditor from '../directives/playlistEditor/playlistEditor.js';
import userEditor from '../directives/userEditor/userEditor.js';
import eventEditor from '../directives/eventEditor/eventEditor.js';
import programEditor from '../directives/programEditor/programEditor.js';
import playlistAutocomplete from '../directives/playlistAutocomplete/playlistAutocomplete.js';
import contentAutocomplete from '../directives/contentAutocomplete/contentAutocomplete.js';
import promotionAutocomplete from '../directives/promotionAutocomplete/promotionAutocomplete.js';
import songAutocomplete from '../directives/songAutocomplete/songAutocomplete.js';
import programPlaylistsEditor from '../directives/programPlaylistsEditor/programPlaylistsEditor.js';
import stringToNumber from '../directives/StringToNumber.js';
import versionEditor from '../directives/versionEditor/versionEditor.js';
import hideForUserGroup from '../directives/hideForUserGroup/hideForUserGroup.js';
import s3Uploader from '../directives/s3Uploader/s3Uploader.js';
import promotionEditor from '../directives/promotionEditor/promotionEditor.js';
import previewLinkEditor from '../directives/previewLinkEditor/previewLinkEditor.js';
import folderEditor from '../directives/folderEditor/folderEditor.js';
import workingTimeEditor from '../directives/workingTimeEditor/workingTimeEditor.js';

import AuthService from '../services/AuthService.js';
import FilterData from '../services/FilterData.js';

import ConfigFn from './config.js';
import RunFn from './run.js';


angular
    .module('vlans', 
        ['ui.router', abdtpicker, 'ui.calendar', 'ui.bootstrap',
         'ui-notification', 'restangular', 'treeControl', 'ngMasonry',
         'ngjsColorPicker', 'rzModule', 'ngFileUpload', 'dndLists',
         'ngTagsInput', 'LocalStorageModule', 'angularMoment']
    )

    .directive('genreSelector', genreSelector)
    .directive('filtersEditor', filtersEditor)
    .directive('clientEditor', clientEditor)
    .directive('clientGroupEditor', clientGroupEditor)
    .directive('clientAutocomplete', clientAutocomplete)
    .directive('playlistEditor', playlistEditor)
    .directive('userEditor', userEditor)
    .directive('eventEditor', eventEditor)
    .directive('programEditor', programEditor)
    .directive('programPlaylistsEditor', programPlaylistsEditor)
    .directive('playlistAutocomplete', playlistAutocomplete)
    .directive('promotionAutocomplete', promotionAutocomplete)
    .directive('contentAutocomplete', contentAutocomplete)
    .directive('songAutocomplete', songAutocomplete)
    .directive('stringToNumber', stringToNumber)
    .directive('versionEditor', versionEditor)
    .directive('hideForUserGroup', hideForUserGroup)
    .directive('s3Uploader', s3Uploader)
    .directive('promotionEditor', promotionEditor)
    .directive('previewLinkEditor', previewLinkEditor)
    .directive('folderEditor', folderEditor)
    .directive('workingTimeEditor', workingTimeEditor)

    .service('AuthService', AuthService)
    .service('FilterData', FilterData)

    .config(ConfigFn)

    .run(RunFn);
