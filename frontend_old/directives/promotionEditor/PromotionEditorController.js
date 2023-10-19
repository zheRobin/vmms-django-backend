/* @ngInject */
const PromotionEditorController = function($scope) {
    $scope.addPromotion = () => {
        $scope.promotions.push({});
    };

    $scope.removePromo = (promoIndex) => {
        $scope.promotions.splice(promoIndex, 1);
    };
};

export default PromotionEditorController;
