import _ from 'lodash';


/* @ngInject */
const ProgramPlaylistsEditorController =
function($timeout, $scope, Notification) {
    const SLIDER_MAX = 100;
    const SLIDER_MIN = 0;
    const MAX_SLIDER_TOTAL = 100;

    $scope.$$postDigest(function () {
        $scope.$broadcast('rzSliderForceRender');
    });
    $scope.$watch('pplaylists', (newPlaylists) => {
        if(newPlaylists === undefined) {
            $scope.pplaylists = [];
        }
    });

    $scope.onPercentageChange = (fixedPplaylist, $index) => {
        if(fixedPplaylist.percentage > SLIDER_MAX) {
            fixedPplaylist.percentage = SLIDER_MAX;
        }
        if(fixedPplaylist.percentage < SLIDER_MIN) {
            fixedPplaylist.percentage = SLIDER_MIN;
        }
        if($scope.pplaylists.length === 1) {
            if($scope.pplaylists[0].percentage === 100)
                return;
            $scope.pplaylists[0].percentage = 100;
            return; 
        }
        // Rest of the inputs
        let rest = _.filter($scope.pplaylists, (p, i) => i !== $index);
        // Total percentage of other inputs
        let restTotal = _.sum(_.map(rest, (r) => r.percentage));
        // Total percentage sum
        let total = restTotal + fixedPplaylist.percentage;
        // If it doesn't equal to max value possible
        if(total != MAX_SLIDER_TOTAL) {
            // Calculate difference
            let diff = MAX_SLIDER_TOTAL - total;
            // Value to add to each input?
            let d = Math.ceil(diff / rest.length);
            let excluded = [];
            let oldLength = -1;
            let newPercentage;
            while(oldLength != excluded.length) {
                oldLength = excluded.length;
                _.each($scope.pplaylists, (p, i) => {
                    newPercentage = p.percentage + d;
                    if(newPercentage > SLIDER_MAX || newPercentage < SLIDER_MIN) {
                        excluded = _.union([i], excluded);
                    }
                });
                d = Math.ceil(diff / (rest.length - excluded.length));
            }
            _.each($scope.pplaylists, (p, i) => {
                if(i !== $index && !_.includes(excluded, i)) {
                    p.percentage += d;
                }
            });
        }
    };

    $scope.createNew = () => {
        if($scope.pplaylists.length !== 0) {
            $scope.pplaylists.push({ percentage: 0 });
        } else {
            $scope.pplaylists.push({ percentage: 100 });
        }
    };

    $scope.delete = (pplaylist) => {
        $scope.pplaylists.splice(_.indexOf($scope.pplaylists, pplaylist), 1);
    };

    $scope.$watch('pplaylists', (pps) => {
        let used = [];
        _.each(pps, (p) => {
            if(p === undefined || p.playlist === undefined)
                return;
            if(_.includes(used, p.playlist.id)) {
                if(p.playlist.id !== undefined) {
                    Notification.info('Sorry, you cannot select the same playlist twice.');
                    delete p.playlist;
                }
            } else {
                used.push(p.playlist.id);
            }
        })
    }, true);
};

export default ProgramPlaylistsEditorController;
