import _ from 'lodash';


/* @ngInject */
const VersionsController = function($scope, Restangular, Notification)
{
    $scope.bindings = {};
    let refreshVersions = () => {
        Restangular
            .all('player-version')
            .getList()
            .then((versions) => {
                $scope.bindings.currentVersion = _.first(_.filter(versions, (version) => version.current));
                $scope.versions = _.orderBy(versions, ['created_at'], ['desc']);
            });
    };

    $scope.createNew = () => {
        $scope.newVersion = {};
    };

    $scope.onSelection = (version) => {
        $scope.newVersion = version;
    };

    $scope.editCurrent = () => {
        $scope.editingCurrent = true;
    }

    $scope.updateCurrent = () => {
        if(!confirm('Are you sure that you want to update the current version? This will affect all clients.')) {
            return;
        }
        $scope.bindings.currentVersion.current = true;
        Restangular.restangularizeElement(
            $scope.bindings.currentVersion.parentResource,
            $scope.bindings.currentVersion,
            $scope.bindings.currentVersion.route
        );
        console.log($scope.bindings.currentVersion)
        $scope
            .bindings
            .currentVersion
            .put()
            .then(() => {
                $scope.editingCurrent = false;
                Notification.success('Current version updated.');
            });
    };

    refreshVersions();

    $scope.$on('version:deleted', refreshVersions);
    $scope.$on('version:created', refreshVersions);
    $scope.$on('version:updated', refreshVersions);

};

export default VersionsController;
