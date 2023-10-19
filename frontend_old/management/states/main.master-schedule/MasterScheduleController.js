import _ from 'lodash';
import moment from 'moment';
import { buildFolderedTree, traverseTree } from '../../../util.js';


/* @ngInject */
const ScheduleController =
function($q, $scope, uiCalendarConfig, Notification, Restangular) {
    const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const CALENDAR_NAME = 'scheduleCalendar';
    const TREE_OPTIONS = {
        dirSelectable: false
    };

    $scope.treeOptions = TREE_OPTIONS;

    let latestEvents;

    let onMasterScheduleGranularToggle = (client) => {
        Restangular
            .one('client', client.id)
            .customPUT(null, 'master-schedule', {
                'master-schedule': client.master_schedule_enabled
            })
            .then(
                (client) => {
                    let verb = client.master_schedule_enabled ? 'enabled' : 'disabled';
                    Notification.success('Master schedule ' + verb + ' for client "' + client.name + '"');
                },
                () => Notification.error('Failed to update client. Please, report this incident.')
            )
    };

    let onMasterScheduleAllToggle = (newEnabled) => {
        Restangular
            .all('client')
            .customPUT(null, 'master-schedule', {
                'master-schedule': newEnabled
            })
            .then(
                (client) => {
                    let verb = newEnabled ? 'enabled' : 'disabled';
                    Notification.success('Master schedule ' + verb + ' for all clients.');
                },
                () => Notification.error('Failed to update clients. Please, report this incident.')
            )
    };

    let parseTimeString = (timeStr) => {
        if(timeStr !== null) {
            let data = timeStr.split(':');
            let hours = parseInt(data[0]);
            let minutes = parseInt(data[1]);
            let seconds = parseInt(data[2]);
            let result = new Date();
            result.setHours(hours, minutes, seconds);
            return moment.utc(result);
        } else {
            return null;
        }
    };
    let loadClients = () => {
        $q.all([
            Restangular
                .all('client-folder')
                .getList(),
            Restangular
                .all('client')
                .getList()
        ]).then((results) => $scope.clientsTree = _.orderBy(
            buildFolderedTree(
                    _.sortBy(results[0], 'name'),
                    _.sortBy(results[1], 'name')
            ), (folder) => folder.name.toLowerCase()
        ));
    };
    let loadSchedule = (client, start, end) => {
        let deferred = $q.defer();
        let resultingEvents = [];
        let schedulePromise = Restangular
            .one('client', client.id)
            .customGET('schedule', {
                schedule_start: start.format(),
                schedule_end: end.format()
            });

        schedulePromise
            .then((schedule) => {
                latestEvents = schedule.events;
                processSchedule(schedule, resultingEvents);
                deferred.resolve(resultingEvents);
            });
        return deferred.promise;
    };
    let processSchedule = (schedule, container) => {
        let calendarEvent;
        _.each(schedule.events, (event) => {
            _.each(schedule.event_dates[event.id], (eventDate) => {
                calendarEvent = {};
                calendarEvent.id = event.id;
                calendarEvent.title = event.content.object.prefix + ' ' + event.content.object.name;
                calendarEvent.color = event.content.object.color;
                calendarEvent.start = moment(eventDate.start).tz('Etc/UTC');
                calendarEvent.end = moment(eventDate.end).tz('Etc/UTC');
                container.push(calendarEvent);
            });
        });
    };
    let refreshSchedule = () => {
        if($scope.selected.client &&
           $scope.selected.calendarPeriod) {
            uiCalendarConfig.calendars[CALENDAR_NAME].fullCalendar('refetchEvents');
        }
    };

    $scope.onEventClick = (event, jsEvent, view) => {
        let ev = _.find(latestEvents, (e) => e.id == event.id);
        $scope.selected.event = ev;
    };

    $scope.createEvent = () => {
        $scope.selected.event = {};
    };

    $scope.saveClient = () => {
        $scope.selected.clientFull
            .put()
            .then(
                () => {
                    Notification.success('Basic content updated.');
                },
                () => {
                    Notification.error('Failed to updated basic content. Please, report this incident.');
                }
            )
    };

    $scope.nodeMasterScheduleToggle = ($event, node) => {
        $event.stopImmediatePropagation();
        onMasterScheduleGranularToggle(node);
    };

    $scope.onSelection = (node, selected) => {
        if(node.route === 'client') {
            node.master_schedule_enabled = !node.master_schedule_enabled;
            onMasterScheduleGranularToggle(node);
        }
    };

    $scope.enableAll = () => {
        traverseTree($scope.clientsTree, (node) => node.master_schedule_enabled = true);
        onMasterScheduleAllToggle(true);
    };

    $scope.disableAll = () => {
        traverseTree($scope.clientsTree, (node) => node.master_schedule_enabled = false);
        onMasterScheduleAllToggle(false);
    };

    $scope.expandAll = () => {
        traverseTree($scope.clientsTree, (node) => {
            if(node.route === 'client-folder') {
                if(_.indexOf($scope.expandedNodes, node) === -1) {
                    $scope.expandedNodes.push(node);
                }
            }
        });
    };

    $scope.collapseAll = () => {
        $scope.expandedNodes.splice(0, $scope.expandedNodes.length);
    };

    $scope.selected = {
        client: {
            id: -1
        }
    };
    $scope.schedule = [];
    $scope.eventSources = [];
    $scope.uiConfig = {
        calendar: {
            defaultView: 'agendaWeek',
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            eventClick: $scope.onEventClick,
            timeFormat: 'HH:mm',
            events: (start, end, timezone, callback) => {
                $scope.loaderVisible = true;
                if($scope.selected.client) {
                    let schedulePromise = loadSchedule($scope.selected.client, start, end);
                    schedulePromise.then((events) => {
                        callback(events);
                        $scope.loaderVisible = false;
                    });
                } else {
                    callback([]);
                    $scope.loaderVisible = false;
                }
            }
        }
    };
    $scope.changeView = (view) => {
        if(view === 'week') {
            view = 'agendaWeek'
        }
        uiCalendarConfig.calendars[CALENDAR_NAME].fullCalendar('changeView', view);
    };

    //$scope.$watch('selected.calendarPeriod', refreshSchedule);
    $scope.$on('event:created', refreshSchedule);
    $scope.$on('event:updated', refreshSchedule);
    $scope.$on('event:deleted', () => {
        $scope.selected.event = undefined;
        refreshSchedule();
    });

    loadClients();
};


export default ScheduleController;