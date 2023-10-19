/* @ngInject */
const SongAutocompleteController =
function($scope, $q, Restangular) {
    const SUGGESTIONS_COUNT = 10;

    let doSearch = (query) => {
        let deferred = $q.defer();
        if(query !== undefined && query !== '') {
            Restangular
                .all('song')
                .getList({query: query, limit: SUGGESTIONS_COUNT})
                .then((songs) => deferred.resolve(songs));
        } else {
            deferred.resolve([]);
        }
        return deferred.promise;
    };

    let getLabel = (song) => {
        return song.artist + " - " + song.title;
    };

    let doNotUpdate = false;

    $scope.getLabel = getLabel;

    $scope.select = (song) => {
        $scope.songs = [];
        $scope.query = '';
        $scope.onSelect({$song: song});           
    };

    $scope.$watch('query', (newQuery) => {
        if(doNotUpdate) {
            doNotUpdate = false;
            return;
        }
        doSearch(newQuery)
            .then((songs) => $scope.songs = songs);
    });
};

export default SongAutocompleteController;
