/* @ngInject */
const PlaylistAutocompleteController =
function($scope, $q, Restangular) {
    let doSearch = (query) => {
        let deferred = $q.defer();
        if(query !== undefined && query !== '') {
            let queryParams = {query: query, limit: $scope.limit};
            if($scope.excludeManual) {
                queryParams['exclude_manual'] = "";
            }
            Restangular
                .all('playlist')
                .getList(queryParams)
                .then((playlists) => deferred.resolve(playlists));
        } else {
            deferred.resolve([]);
        }
        return deferred.promise;
    };

    let getLabel = (playlist) => {
        return playlist.name;
    };

    let doNotUpdate = false;

    $scope.$watch('model', (playlist) => {
        if(playlist !== undefined && playlist.id) {
            doNotUpdate = true;
            $scope.query = getLabel(playlist);
        } else {
            $scope.query = '';
        }
    });

    $scope.clear = () => {
        if($scope.model !== undefined) {
            $scope.query = "";
            delete $scope.model;
        }
    };

    $scope.select = (playlist) => {
        $scope.playlists = [];
        $scope.model = playlist;            
    };

    $scope.$watch('query', (newQuery) => {
        if(doNotUpdate) {
            doNotUpdate = false;
            return;
        }
        $scope.model = undefined;
        doSearch(newQuery)
            .then((playlists) => $scope.playlists = playlists);
    });
};

export default PlaylistAutocompleteController;
