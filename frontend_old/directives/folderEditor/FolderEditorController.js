import _ from 'lodash';


/* @ngInject */
const FolderEditorController =
function($rootScope, $scope, $q, Restangular, Notification) {

    let validate = (folder) => {
        let errors = [];
        return errors;
    };

    $scope.save = () => {
        let formatErrorMsgFromResponse = (response) => {
            if(typeof response.data === 'object') {
                let errors = response.data;
                errors = _.map(errors, (error, fieldName) => {
                    return fieldName + ': ' + error;
                });
                return ('Cannot save folder:<br>' + errors.join('<br>'));
            } else {
                return ('Unexpected error occured. Please, report this incident.');
            }
        };
        let formatErrors = (errors) => {
            return 'Cannot save folder:<br>' + errors.join('<br>');
        };
        let showErrorMsg = (msg) => {
            Notification.error(msg);
        };
        let errors = validate($scope.folder);
        if(errors.length > 0) {
            showErrorMsg(formatErrors(errors));
            return;
        }
        $scope.folder
            .put()
            .then(
                () => {
                    Notification.success('Folder updated.');
                    $scope.onSave();
                },
                () => {
                    Notification.error('Failed to update folder. Please, report this incident.');
                }
            );
    };
    $scope.$watch('parents', (parents) => {
        if(parents === undefined || $scope.folder == undefined)
            return;
        $scope.filteredParents = _.orderBy(_.filter(parents, (parent) => parent.id !== $scope.folder.id), (parent) => parent.name.toLowerCase());
    });
    $scope.$watch('folder', (folder) => {
        if($scope.parents === undefined || folder == undefined)
            return;
        if(folder.$cloned === undefined) {
            let cloned = Restangular.copy(folder);
            cloned.$cloned = true;
            $scope.folder = cloned;
            return;
        }
        $scope.filteredParents = _.filter($scope.parents, (parent) => parent.id !== $scope.folder.id);
    });
};

export default FolderEditorController;
