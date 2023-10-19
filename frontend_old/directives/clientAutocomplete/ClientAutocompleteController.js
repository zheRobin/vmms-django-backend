/* @ngInject */
const ClientAutocompleteController =
function($scope, $q, Restangular) {
    let doSearch = (query) => {
        let deferred = $q.defer();
        if(query !== undefined && query !== '') {
            Restangular
                .all('client')
                .getList({includeFolder: true, query: query, limit: $scope.limit})
                .then((results) => {
                    deferred.resolve(results);
                });
        } else {
            deferred.resolve([]);
        }
        return deferred.promise;
    };


    let doNotUpdate = false;

    $scope.$watch('model', (obj) => {
        if (obj !== undefined) {
            doNotUpdate = true;
            $scope.model = obj;
            $scope.query = $scope.getLabel(obj);
        }
    });

    $scope.getLabel = (obj) => {
        if(typeof obj.parent === 'object') {
            return obj.parent.name + ' - ' + obj.name;
        } else {
            return obj.name;
        }
    };

    $scope.select = (obj) => {
        $scope.objects = [];
        $scope.model = obj;            
    };

    $scope.onContainerClick = () => {
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
            .then((objects) => {
                $scope.objects = objects;
                console.log(objects);
            });
    }, 300));
};

export default ClientAutocompleteController;
