import _ from 'lodash';
import moment from 'moment';
import { buildFolderedTree, traverseTree } from '../../../util.js';


/* @ngInject */
const GroupScheduleController =
function($q, $scope, uiCalendarConfig, Notification, Restangular) {
    const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const CALENDAR_NAME = 'scheduleCalendar';
    const TREE_OPTIONS = {
        dirSelectable: false
    };

    $scope.treeOptions = TREE_OPTIONS;

    let latestEvents;

    let show = (key) => {
        if(key === 'editor') {
            $scope.showEditor = true;
            $scope.showWelcome = false;
            $scope.showSchedule = false;
        } else if(key === 'schedule') {
            $scope.showSchedule = true;
            $scope.showEditor = false;
            $scope.showWelcome = false;
        } else if(key === 'welcome') {
            $scope.showWelcome = true;
            $scope.showEditor = false;
            $scope.showSchedule = false;
        }
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
    let loadClientGroups = () => {
        Restangular
            .all('client-group')
            .getList()
            .then((groups) => {
                $scope.groups = groups;
            });
    };
    
    let loadSchedule = (group, start, end) => {
        let deferred = $q.defer();
        let resultingEvents = [];
        let schedulePromise = Restangular
            .one('client-group', group.id)
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
        console.log('Refresh schedule called');
        if($scope.selected.group) {
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
        if(selected) {
            $scope.selected.group = Restangular.copy(node);
            show('schedule');
        } else {
            show('welcome');
        }
    };

    $scope.deleteSelectedClientGroup = () => {
        if(confirm(
            'Are you sure that you want to delete the client group? All assosiated events' +
            'will be deleted as well. This action is irreversible.'
        )) {
            $scope
                .selected
                .group
                .remove()
                .then(() => {
                    $scope.$broadcast('client-group:deleted');
                    Notification.success('Client group deleted.');
                });
        }
    };

    $scope.editSelectedClientGroup = () => {
        show('editor');
    };

    $scope.createNewClientGroup = () => {
        show('editor');
        $scope.selectedNode = undefined;
        $scope.selected.group = undefined;
    };

    $scope.selected = {};
    $scope.schedule = [];
    $scope.eventSources = [$scope.schedule];
    $scope.uiConfig = {
        calendar: {
            defaultView: 'agendaWeek',
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            eventClick: $scope.onEventClick,
            events: (start, end, timezone, callback) => {
                $scope.loaderVisible = true;
                if($scope.selected.group) {
                    let schedulePromise = loadSchedule($scope.selected.group, start, end);
                    schedulePromise.then((events) => {
                        callback(events);
                        $scope.loaderVisible = false;
                    });
                } else {
                    callback([]);
                    $scope.loaderVisible = false;
                }
            },
            timeFormat: 'HH:mm'
        }
    };
    $scope.changeView = (view) => {
        if(view === 'week') {
            view = 'agendaWeek'
        }
        uiCalendarConfig.calendars[CALENDAR_NAME].fullCalendar('changeView', view);
    };

    $scope.$watch('selected.calendarPeriod', refreshSchedule);
    $scope.$watch('selected.group', refreshSchedule);
    $scope.$on('event:created', refreshSchedule);
    $scope.$on('event:updated', refreshSchedule);
    $scope.$on('event:deleted', () => {
        $scope.selected.event = undefined;
        refreshSchedule();
    });

    $scope.$on('client-group:created', loadClientGroups);
    $scope.$on('client-group:updated', loadClientGroups);
    $scope.$on('client-group:deleted', loadClientGroups);

    loadClientGroups();
    show('welcome');
};


export default GroupScheduleController;