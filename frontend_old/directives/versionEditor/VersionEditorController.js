import _ from 'lodash';
import $ from 'jquery';
import { transform } from '../../transform.js';


/* @ngInject */
const VersionEditorController =
function($rootScope, $scope, $q, Restangular, Notification) {
    let validate = (version) => {
        let errors = [];
        if(version.version_string === '' || version.version_string === undefined) {
            errors.push('Version string cannot be empty');
        }
        if(version.link === '' || version.link === undefined) {
            errors.push('You need to upload an artifact for a new version.');
        }
        return errors;
    }

    let transformRules = {
    };

    $scope.upload = (file) => {
        // Get signed request data
        Restangular
            .all('s3')
            .customPOST(
                {
                    file_name: file.name,
                    file_type: file.type
                },
                'sign-upload-request'
            ).then((response) => {
                // Now we need to actually upload the file to S3
                let uploadRequestData = new FormData();
                _.each(response.data.fields, (value, field) => uploadRequestData.append(field, value));
                uploadRequestData.append('file', file);
                $.ajax({
                    url: response.data.url,
                    data: uploadRequestData,
                    type: 'POST',
                    processData: false,
                    contentType: false,
                    success: () => {
                        // Uploading done
                        $scope.$apply(() => $scope.version.link = response.url);
                    }
                });
            });
    };

    $scope.reupload = () => delete $scope.version.link;

    $scope.save = () => {

        let formatErrorMsgFromResponse = (response) => {
            if(typeof response.data === 'object') {
                let errors = response.data;
                errors = _.map(errors, (error, fieldName) => {
                    return fieldName + ': ' + error;
                });
                return ('Cannot save version:<br>' + errors.join('<br>'));
            } else {
                return ('Unexpected error occured. Please, report this incident.');
            }
        };
        let formatErrors = (errors) => {
            return 'Cannot save version:<br>' + errors.join('<br>');
        };
        let showErrorMsg = (msg) => {
            Notification.error(msg);
        };
        let errors = validate($scope.version);
        if(errors.length > 0) {
            showErrorMsg(formatErrors(errors));
            return;
        }
        if(!confirm('Are you sure, that you want to create a new version?')) {
            return;
        }
        transform(transformRules, $scope.version, 'backward', Restangular)
            .then((transformed) => {
                if($scope.isNew) {
                    Restangular
                        .all('player-version')
                        .post(transformed)
                        .then(
                            (version) => {
                                transform(transformRules, version, 'forward', Restangular)
                                    .then((transformed) => $scope.$apply(() => $scope.version = transformed));
                                Notification.success('New version has been created.');
                                $rootScope.$broadcast('version:created');
                            },
                            (response) => {
                                showErrorMsg(formatErrorMsgFromResponse(response));
                            }
                        );
                } else {
                    // Manually fixing routing issue
                    // see: https://github.com/mgonto/restangular/issues/769
                    transformed.route = 'player-version';
                    transformed
                        .put()
                        .then(
                            () => {
                                Notification.success('Version successfuly updated.');
                                $rootScope.$broadcast('version:updated');
                            },
                            () => {
                                showErrorMsg(formatErrorMsgFromResponse(response));
                            }
                        );
                }
            });
    };
    $scope.delete = () => {
        let confirmed = confirm('Are you sure you want to delete this version? This action cannot be reversed.');
        if(confirmed) {
            delete $scope.version.source;
            $scope.version.route = 'player-version';
            $scope
                .version
                .remove()
                .then(
                    () => {
                        $rootScope.$broadcast('version:deleted');
                        Notification.success('Version deleted sucessfuly.');
                    }
                )
        }
    };

    $scope.$watch('version', (newModel) => {
        if(!newModel || !newModel.$transformed) {
            transform(transformRules, newModel, 'forward', Restangular)
                .then((transformed) => {
                    $scope.$apply(() => $scope.version = transformed);
                });
        } else {
            $scope.isNew = $scope.version.id === undefined;
        }
    });
};

export default VersionEditorController;
