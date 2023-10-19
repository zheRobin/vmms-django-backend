/* @ngInject */
const GenreSelectorController =
function($rootScope, $scope, $q, Restangular, Notification) {
    let buildTrees = (categories, genres) => {
        let cats = {};
        _.each(categories, (cat) =>  {
            cats[cat.id] = Restangular.copy(cat);
            cats[cat.id].genres = [];
        });
        _.each(genres, (genre) => {
            _.each(cats, (cat) => {
                if(genre.category === cat.id) {
                    cat.genres.push(Restangular.copy(genre));
                }
            });
        });
        cats = _.filter(cats, (cat) => {
            return cat.genres.length > 0;
        });
        cats = _.sortBy(cats, 'order');
        cats = _.map(cats, (cat) => {
            cat.genres = _.sortBy(cat.genres, 'order');
            return cat;
        });
        return cats;
    };
    let loadData = () => {
        $q
            .all([
                Restangular
                    .all('category')
                    .getList(),
                Restangular
                    .all('genre')
                    .getList()
            ])
            .then((results) => {
                $scope.categories = buildTrees(results[0], results[1]);
            });
    };
    $scope.$watch('model', (newValue) => {
        if(newValue === undefined) {
            $scope.model = {};
        }
    });
    $scope.categories = [];
    loadData();
};

export default GenreSelectorController;