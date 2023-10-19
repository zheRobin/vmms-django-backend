import moment from 'moment';
import _ from 'lodash';
import { transform } from '../../transform.js';


/* @ngInject */
const EventEditorController =
function($rootScope, $scope, $q, Restangular, Notification) {
    $scope.repeatingOptions = [
        { key: 'NO', value: 'No' },
        { key: 'DAY', value: 'Daily' },
        { key: 'WEEK', value: 'Weekly' },
        { key: 'MONTH', value: 'Monthly' }
    ];

    let getEditorMode = () => {
        if($scope.client) {
            return 'client';
        } else {
            return 'client-group';
        }
    };

    let dateToUTC = (date) => {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    };

    let validate = (event) => {
        let errors = [];
        if(event.name === undefined || event.name === '') {
            errors.push('Event name cannot be empty.');
        }
        if(event.content === undefined) {
            errors.push('Please, select content for the event.');
        }
        if(event.start === undefined || !moment(event.start).isValid()) {
            errors.push('Invalid event start date.');
        }
        if(event.end === undefined || !moment(event.end).isValid()) {
            errors.push('Invalid event end date.');
        }
        return errors;
    };

    let transformRules = {
        repeating: {
            forward: function(value) {
                if(value === undefined || value === '') {
                    return 'NO';
                }
                return value;
            },
            backward: _.identity
        },
        playlist: {
            forward: function(value) {
                if(typeof(value) === 'number') {
                    return Restangular
                        .one('playlist', value)
                        .get();
                } else {
                    return undefined;
                }
            },
            backward: function(value) {
                if(value !== undefined) {
                    return value.id;
                }
                return undefined;
            }
        },
        group: {
            forward: _.identity,
            backward: function(value) {
                if(value === undefined && $scope.clientGroup) {
                    return $scope.clientGroup.id;
                }
                return value;
            }
        },
        client: {
            forward: _.identity,
            backward: function(value) {
                if(value === undefined && $scope.client) {
                    return $scope.client.id;
                }
                return value;
            }
        },
        source: {
            forward: _.identity,
            backward: _.noop
        },
        start: {
            forward: function(value) {
                if(typeof(value) === 'string') {
                    return moment(value).tz('Etc/UTC');
                }
                return value;
            },
            backward: function(value) {
                let hasTzInfo = value.toString().indexOf('+0000') === -1;
                if(!value.isMoment) {
                    value = moment(value);
                    var another = value.clone();
                    another.tz('Etc/UTC');
                    if(hasTzInfo)
                        another.add(value.utcOffset() - another.utcOffset(), 'minutes');
                    value = another;
                }
                return value.format();
            }
        },
        end: {
            forward: function(value) {
                if(typeof(value) === 'string') {
                    return moment(value).tz('Etc/UTC');
                }
                return value;
            },
            backward: function(value) {
                let hasTzInfo = value.toString().indexOf('+0000') === -1;
                if(!value.isMoment) {
                    value = moment(value);
                    var another = value.clone();
                    another.tz('Etc/UTC');
                    if(hasTzInfo)
                        another.add(value.utcOffset() - another.utcOffset(), 'minutes');
                    value = another;
                }
                return value.format();
            }
        },
        repeating_end: {
            forward: function(value) {
                if(typeof(value) === 'string') {
                    return moment(value).tz('Etc/UTC');
                }
                return value;
            },
            backward: function(value) {
                if(value != undefined) {
                    let hasTzInfo = value.toString().indexOf('+0000') === -1;
                    if(!value.isMoment) {
                        value = moment(value);
                        var another = value.clone();
                        another.tz('Etc/UTC');
                        if(hasTzInfo)
                            another.add(value.utcOffset() - another.utcOffset(), 'minutes');
                        value = another;
                    }
                    return value.format();
                } else {
                    return value;
                }
            }
        }
    };

    $scope.save = () => {
        let formatErrorMsgFromResponse = (response) => {
            if(typeof response.data === 'object') {
                let errors = response.data;
                errors = _.map(errors, (error, fieldName) => {
                    return fieldName + ': ' + error;
                });
                return ('Cannot save event:<br>' + errors.join('<br>'));
            } else {
                return ('Unexpected error occured. Please, report this incident.');
            }
        };
        let formatErrors = (errors) => {
            return 'Cannot save event:<br>' + errors.join('<br>');
        };
        let showErrorMsg = (msg) => {
            Notification.error(msg);
        };
        let errors = validate($scope.event);
        if(errors.length > 0) {
            showErrorMsg(formatErrors(errors));
            return;
        }
        transform(transformRules, $scope.event, 'backward', Restangular)
            .then((transformed) => {
                let editorMode = getEditorMode();
                if($scope.isNew) {
                    if(editorMode === 'client') {
                        Restangular
                            .all('event')
                            .post(transformed)
                            .then(
                                (event) => {
                                    transform(transformRules, event, 'forward', Restangular)
                                        .then((transformed) => $scope.$apply(() => $scope.event = transformed));
                                    Notification.success('New event has been created.');
                                    $rootScope.$broadcast('event:created');
                                },
                                (response) => {
                                    showErrorMsg(formatErrorMsgFromResponse(response));
                                }
                            );
                    } else if(editorMode === 'client-group') {
                        Restangular
                            .all('group-event')
                            .post(transformed)
                            .then(
                                (event) => {
                                    transform(transformRules, event, 'forward', Restangular)
                                        .then((transformed) => $scope.$apply(() => $scope.event = transformed));
                                    Notification.success('New event has been created.');
                                    $rootScope.$broadcast('event:created');
                                },
                                (response) => {
                                    showErrorMsg(formatErrorMsgFromResponse(response));
                                }
                            );
                    }
                } else {
                    // Manually fixing routing issue
                    // see: https://github.com/mgonto/restangular/issues/769
                    if(editorMode === 'client') {
                        transformed.route = 'event';
                    } else if(editorMode === 'client-group'){
                        transformed.route = 'group-event';
                    }
                    transformed
                        .put()
                        .then(
                            () => {
                                Notification.success('Event successfuly updated.');
                                $rootScope.$broadcast('event:updated');
                            },
                            () => {
                                showErrorMsg(formatErrorMsgFromResponse(response));
                            }
                        );
                }
            });
    };
    $scope.delete = () => {
        let confirmed = confirm('Are you sure you want to delete this event? This action cannot be reversed.');
        if(confirmed) {
            delete $scope.event.source;
            let editorMode = getEditorMode();
            if(editorMode === 'client') {
                $scope.event.route = 'event';
            } else if(editorMode === 'client-group') {
                $scope.event.route = 'group-event';    
            }
            $scope
                .event
                .remove()
                .then(
                    () => {
                        $rootScope.$broadcast('event:deleted');
                        Notification.success('Event deleted sucessfuly.');
                    }
                )
        }
    };

    // Making sure end date is after start date
    // ----------------------------------------
    //
    // Event handlers that also are emitting events when dates are set
    $scope.startDateOnSetTime = () => {
        $scope.$broadcast('start-date:change');
        if(!$scope.event.end) {
            $scope.event.end = moment($scope.event.start).clone().add(1, 'hours');
            $scope.endDateOnSetTime();
        }
    };
    $scope.endDateOnSetTime = () => {
        $scope.$broadcast('end-date:change');
    };
    // Event handlers that do date filtering to make our logic work
    $scope.startDateBeforeRender = ($dates) => {
        if($scope.event.end) {
            let activeDate = moment($scope.event.end);
            $dates
                .filter((date) => date.localDateValue() >= activeDate.valueOf())
                .forEach((date) => date.selectable = false);
        }
    };
    $scope.endDateBeforeRender = ($view, $dates) => {
        if($scope.event.start) {
            let activeDate = moment($scope.event.start).subtract(1, $view).add(1, 'minute');
            $dates
                .filter((date) => date.localDateValue() <= activeDate.valueOf())
                .forEach((date) => date.selectable = false);   
        }
    };
    $scope.rendDateBeforeRender = ($view, $dates) => {
        if($scope.event.start) {
            let activeDate = moment($scope.event.start).subtract(1, $view).add(1, 'minute');
            $dates
                .filter((date) => date.localDateValue() <= activeDate.valueOf())
                .forEach((date) => date.selectable = false);   
        }
    };

    $scope.$watch('event', (newModel) => {
        if(!newModel || !newModel.$transformed) {
            transform(transformRules, newModel, 'forward', Restangular)
                .then((transformed) => {
                    $scope.$apply(() => $scope.event = transformed);
                });
        } else {
            $scope.isNew = $scope.event.id === undefined;
        }
    });

};

export default EventEditorController;
