/* @ngInject */
const PreviewLinkEditorController = 
($scope, $state, Restangular, Notification) => {
    $scope.$watch('link', (link) => {
        if(link && link.id !== undefined) {
            $scope.isNew = false;
        } else {
            $scope.isNew = true;
        }
    });

    let validate = (link) => {
        let errors = [];
        if(link.name === undefined || link === '') {
            errors.push('Link name cannot be empty');
        }
        if(link.program === undefined) {
            errors.push('Link program cannot be empty');
        }
        return errors;
    };

    let postProcess = (link) => {
        link = Restangular.copy(link);
        link.program = link.program.object.id;
        return link;
    };

    $scope.save = () => {
        let errors = validate($scope.link);
        if(errors.length > 0) {
            Notification.error(errors.join('<br>'));
            return;
        }
        if($scope.isNew) {
            Restangular
                .all('program-preview-link')
                .post(postProcess($scope.link))
                .then(
                    () => {
                        Notification.success('New link created.');
                        $state.go('main.link-previews');
                    },
                    (response) => {
                        if(response.status === 400) {
                            let errorString = _.map(response.data, (errors, field) => {
                                return _.capitalize(field) + ": " + errors.join(', ');
                            }).join('<br>');
                            errorString = "Cannot save: <br>" + errorString;
                            Notification.error(errorString);
                        } else {
                            Notification.error('Failed to update the link. Please, report this incident.');
                        }
                    }
                )
        } else {
            postProcess($scope.link)
                .put()
                .then(
                    () => {
                        Notification.success('Link updated.');
                        $state.go('main.link-previews');  
                    },
                    (response) => {
                        if(response.status === 400) {
                            let errorString = _.map(response.data, (errors, field) => {
                                return _.capitalize(field) + ": " + errors.join(', ');
                            }).join('<br>');
                            errorString = "Cannot save: <br>" + errorString;
                            Notification.error(errorString);
                        } else {
                            Notification.error('Failed to update the link. Please, report this incident.');
                        }
                    }
                )
        }
    };
};

export default PreviewLinkEditorController;