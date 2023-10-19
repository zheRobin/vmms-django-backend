/* @ngInject */
const SongsPreviewController = 
function($scope) {
    const SORT_DIR_ASC = 'asc';
    const SORT_DIR_DESC = 'desc';

    $scope.perPageOptions = [25, 50, 100, 200];
    $scope.perPage = 25;

    let fireChange = () => {
        let params = {
            perPage: $scope.perPage,
            page: $scope.page,
            sortBy: $scope.sortBy,
            sortDir: $scope.sortDir
        };
        $scope.params = params;
        $scope.paramsChange({
            params: params
        });
    };

    $scope.sortPreviewBy = (name) => {
        if($scope.sortBy === name) {
            if($scope.sortDir == SORT_DIR_ASC) {
                $scope.sortDir = SORT_DIR_DESC;
            } else {
                $scope.sortDir = SORT_DIR_ASC;
            }
        } else {
            $scope.sortBy = name;
            $scope.sortDir = SORT_DIR_ASC;
        }
        fireChange();
    };

    $scope.deduplicate = (str) => {
        if(str) {
            return _.uniq(str.split(',')).join(', ');
        }
    };

    $scope.onPerPageChange = () => {
        fireChange();
    };

    $scope.onPageChanged = () => {
        fireChange();
    };

    fireChange();
}

export default SongsPreviewController;
