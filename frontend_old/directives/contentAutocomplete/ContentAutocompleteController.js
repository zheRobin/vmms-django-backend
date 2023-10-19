/* @ngInject */
const ContentAutocompleteController =
function($scope, $q, Restangular) {
    let doSearch = (query) => {
        let deferred = $q.defer();
        if(query !== undefined && query !== '') {
            let requestPromises = [
                Restangular
                .all('program')
                .getList({query: query, limit: $scope.limit})
            ];
            if(!$scope.programsOnly) {
                requestPromises.push(
                    Restangular
                        .all('playlist')
                        .getList({query: query, limit: $scope.limit})  
                );
            }

            $q.all(requestPromises)
            .then((results) => {
                let programs = results[0];
                programs = _.map(programs, (p) => {
                    return { id: 'pr' + p.id, type: 'program', object: p, $wrapped: true };
                });
                if(!$scope.programsOnly) {
                    let playlists = results[1];
                    playlists = _.map(playlists, (p) => {
                        return { id: 'pl' + p.id, type: 'playlist', object: p, $wrapped: true };
                    });
                    deferred.resolve(_.union(programs, playlists));
                } else {
                    deferred.resolve(programs);
                }
            });
        } else {
            deferred.resolve([]);
        }
        return deferred.promise;
    };

    let getLabel = (obj) => {
        return _.capitalize(obj.type) + ' - "' + obj.object.name + '"';
    };

    let doNotUpdate = false;

    $scope.$watch('model', (obj) => {
        if((obj !== undefined && !obj.$empty &&  !obj.$wrapped)) {
            let idPrefix = obj.route === 'program' ? 'pr' : 'pl',
                type = obj.route === 'program' ? 'program' : 'playlist';
            if(obj.type && obj.object) {
                // Already wrapped
                obj.$wrapped = true;
                obj.contentId = obj.id;
                obj.id = idPrefix + obj.object.id;
            } else {
                obj = {
                    contentId: obj.id,
                    id: idPrefix + obj.id,
                    object: obj,
                    type: type,
                    $wrapped: true
                };
                $scope.model = obj;
            }
        } 
        if (obj !== undefined && !obj.$empty && obj.id && obj.$wrapped) {
            doNotUpdate = true;
            $scope.model = obj;
            $scope.query = getLabel(obj);
        }
    });

    $scope.select = (obj) => {
        $scope.objects = [];
        $scope.model = obj;            
    };

    $scope.clear = () => {
        if($scope.model !== undefined) {
            $scope.query = "";
            delete $scope.model;
        }
    };

    $scope.$watch('query', _.debounce((newQuery) => {
        if(doNotUpdate) {
            doNotUpdate = false;
            return;
        }
        $scope.model = undefined;
        doSearch(newQuery)
            .then((objects) => $scope.objects = objects);
    }, 300));
};

export default ContentAutocompleteController;
