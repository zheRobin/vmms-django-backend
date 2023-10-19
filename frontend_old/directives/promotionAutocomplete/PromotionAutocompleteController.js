/* @ngInject */
const PromotionAutocompleteController =
function($scope, $q, Restangular) {
    let doSearch = (query) => {
        let deferred = $q.defer();
        if(query !== undefined && query !== '') {
            let queryParams = {query: query, limit: $scope.limit};
            Restangular
                .all('promotion')
                .getList(queryParams)
                .then((promotions) => deferred.resolve(
                    _.map(promotions, (promotion) => {
                        return {
                            name: promotion.name,
                            promotion_id: promotion.id
                        }
                    })
                ));
        } else {
            deferred.resolve([]);
        }
        return deferred.promise;
    };

    let getLabel = (promotion) => {
        return promotion.name;
    };

    let doNotUpdate = false;

    $scope.$watch('model', (promotion) => {
        if(promotion !== undefined && promotion.promotion_id) {
            doNotUpdate = true;
            $scope.query = getLabel(promotion);
        } else {
            $scope.query = '';
        }
    });

    $scope.select = (promotion) => {
        $scope.promotions = [];
        $scope.model = promotion;     
    };

    $scope.$watch('query', (newQuery) => {
        if(doNotUpdate) {
            doNotUpdate = false;
            return;
        }
        $scope.model = undefined;
        doSearch(newQuery)
            .then((promotions) => $scope.promotions = promotions);
    });
};

export default PromotionAutocompleteController;