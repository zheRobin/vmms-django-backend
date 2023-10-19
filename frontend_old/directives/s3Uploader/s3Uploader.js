import template from './s3Uploader.jade';
import controller from './S3UploaderController.js';


export default function S3Uploader() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            model: '=',
            pattern: '@'
        }
    };
};
