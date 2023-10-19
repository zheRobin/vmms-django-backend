/* @ngInject */
const LinkPreviewEditController =
function($scope, $stateParams, Restangular) {
    Restangular
        .one('program-preview-link', $stateParams.id)
        .get()
        .then((link) => {
            $scope.model = link;
            console.log($scope.model);
        });
};

export default LinkPreviewEditController;
