import _ from 'lodash';
import moment from 'moment';
import { buildFolderedTree, filterTree } from '../../../util.js';


/* @ngInject */
const ScheduleController =
function($q, $scope, uiCalendarConfig, Notification, Restangular) {
    const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const CALENDAR_NAME = 'scheduleCalendar';

    let latestEvents = [];


    let buildTree = (entities) => {
        return _.orderBy(
            buildFolderedTree(
                    _.sortBy(entities.folders, 'name'),
                    _.sortBy(entities.clients, 'name')
            ), (folder) => folder.name.toLowerCase()
        );
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
        ]).then((results) => {
            $scope.clientsTree = buildTree({
                folders: results[0],
                clients: results[1]
            });
            $scope.originalTree = angular.copy($scope.clientsTree);
        });
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
        let clientsPromise = Restangular
            .one('client', client.id)
            .get();
        clientsPromise
            .then((client) => {
                _.each(DAYS, (day) => {
                    if(client[day + '_open'] != null)
                        client[day + '_open'] = parseTimeString(client[day + '_open']);
                    if(client[day + '_close'] != null)
                        client[day + '_close'] = parseTimeString(client[day + '_close']);
                })
                $scope.selected.clientFull = client;
            });
        schedulePromise
            .then((schedule) => {
                latestEvents = schedule.events;
                processSchedule(schedule, resultingEvents);

            });
        $q
            .all([clientsPromise, schedulePromise])
            .then((results) => {
                let currentDate = start;
                let closeEvent,
                    openTime,
                    closeTime;
                while(currentDate <= end) {
                    _.each(DAYS, (day) => {
                        openTime = $scope.selected.clientFull[day + '_open'];
                        closeTime = $scope.selected.clientFull[day + '_close'];
                        if(day.toLowerCase() === currentDate.format('dddd').toLowerCase()) {
                            if($scope.selected.clientFull[day + '_enabled']) {
                                closeEvent = {};
                                closeEvent.title = 'Closed';
                                closeEvent.color = '#d3d3d3';
                                closeEvent.start = currentDate
                                    .clone()
                                    .hours(closeTime.hours())
                                    .minutes(closeTime.minutes())
                                    .seconds(closeTime.seconds());
                                closeEvent.end = currentDate
                                    .clone()
                                    .add(1, 'days')
                                    .hours(openTime.hours())
                                    .minutes(openTime.minutes())
                                    .seconds(openTime.seconds());
                                closeEvent.start = closeEvent.start.toDate();
                                closeEvent.end = closeEvent.end.toDate();

                                resultingEvents.push(closeEvent);
                            }
                        }
                    });
                    currentDate = currentDate.add(1, 'days');
                }
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
        _.each(schedule.group_events, (event) => {
            _.each(schedule.group_event_dates[event.id], (eventDate) => {
                calendarEvent = {};
                calendarEvent.id = event.id;
                calendarEvent.title = 'Group schedule event - ' + event.content.object.prefix + ' ' + event.content.object.name;
                calendarEvent.color = '#ff0000';
                calendarEvent.start = moment(eventDate.start).tz('Etc/UTC');
                calendarEvent.end = moment(eventDate.end).tz('Etc/UTC');
                calendarEvent.className = ['group-event'];
                container.push(calendarEvent);
            });
        });

    };
    let refreshSchedule = () => {
        if($scope.selected.client) {
            uiCalendarConfig.calendars[CALENDAR_NAME].fullCalendar('refetchEvents');
        }
    };

    $scope.onEventClick = (event, jsEvent, view) => {
        let ev = _.find(latestEvents, (e) => e.id == event.id);
        $scope.selected.event = ev;
    };
    $scope.onSelection = (node, selected) => {
        if(selected) {
            if(node.route === 'client') {
                $scope.selected.client = node;
                $scope.selected.event = undefined;
                uiCalendarConfig.calendars[CALENDAR_NAME].fullCalendar('refetchEvents');
            }
        }
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
    }

    $scope.selected = {};
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

    $scope.$watch('searchQuery', (newQuery, oldQuery) => {
        if(newQuery !== '' && newQuery !== undefined) {
            let queryRegexp = new RegExp(newQuery, 'i');
            let result = filterTree($scope.originalTree, (node) => queryRegexp.test(node.name));
            _.remove($scope.clientsTreeExpandedNodes);
            _.each(result['client-folder'], (node) => $scope.clientsTreeExpandedNodes.push(node));
            $scope.clientsTree = buildTree({
                folders: result['client-folder'],
                clients: result['client']
            });
        } else {
            $scope.clientsTree = $scope.originalTree;
        }
    });

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