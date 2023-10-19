import bootbox from 'bootbox';


/* @ngInject */
const LinkPreviewsController =
function($scope, Restangular, Notification) {
    let refresh = () => {
        Restangular
            .all('program-preview-link')
            .getList()
            .then((links) => $scope.links = links);
    };
    $scope.delete = (link) => {
        bootbox.confirm("Are you sure that you want to delete this link?", () => {
            link
                .remove()
                .then(
                    () => {
                        refresh();
                        Notification.success('Link removed');
                    },
                    () => {
                        Notification.error('Failed to remove link. Please, report this incident.');
                    }
                );
        });
    };

    $scope.nameToUrl = (name) => {
        return (
            name.split(" ").join("_").toLowerCase()
        );
    };

    refresh();
};

export default LinkPreviewsController;
