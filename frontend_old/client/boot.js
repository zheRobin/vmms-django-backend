import $ from 'jquery';
import 'lodash';
import 'bootstrap-webpack';
import 'angular';
import 'angular-ui-router';
import 'angular-ui-notification/dist/angular-ui-notification.js';
import 'angular-ui-notification/dist/angular-ui-notification.css';
import 'restangular';

import '../assets/styles/global.css';

import ConfigFn from './config.js';
import RunFn from './run.js';


$(document).ready(function() {
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});

angular
    .module('vlans', 
        ['ui.router', 'ui-notification', 'restangular']
    )

    .config(ConfigFn)

    .run(RunFn);
