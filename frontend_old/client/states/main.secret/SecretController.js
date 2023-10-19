import _ from 'lodash';


const CLIENT_CONTENTS_COUNT = 7;

/* @ngInject */
const SecretController =
function($scope, $stateParams, $interval, Restangular, Notification) {
    let MonitoringRestangular = Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('https://monitoring.vmms.network/api/v1/');
    });

    let getLastPlayerInfo = () => {
        MonitoringRestangular
            .all('player-by-key')
            .customGET('', { 'api_key': $scope.client.api_key })
            .then(
                (response) => {
                    $scope.lastPlayerInfo = response;
                    setActiveContentByName(response.last_playlist_played);
                }
            );
        
    Restangular
        .all('client')
        .one('secret', $stateParams.loginKey)
        .get()
        .then(
            (client) => {
                if(client.volume_request) {
                    $scope.pendingVolume = client.volume_request.volume;
                }
            }
        );
    };


    let setFlashingContent = (content) => {
        let contents = _.union([$scope.client.basic_content], $scope.client.contents);
        let id,
            contentId = content.value === undefined ? content.id : content.contentId;
        _.each(contents, (c) => {
            id = c.value === undefined ? c.id : c.contentId; 
            if(id === contentId) {
                c.$flashing = true;
            } else {
                c.$flashing = false;
            }
        });
    };

    let setActiveContentByName = (contentName) => {
        let contents = _.union([$scope.client.basic_content], $scope.client.contents);
        let name, originalName;
        let found = false;
        _.each(contents, (c) => {
            name = c.value === undefined ? c.object.name : c.value.name;
            originalName = c.value === undefined ? c.object.originalName : undefined;
            if((name === contentName || originalName === contentName) && !found) {
                found = true;
                c.$active = true;
                if(c === $scope.client.basic_content && contentName === originalName) {
                    c.object.name = c.object.originalName;
                    delete c.object.originalName;
                }
                if(c.$flashing) {
                    c.$flashing = false;
                    Notification.success(name + ' activated.');
                }
            } else {
                c.$active = false;
            }
        });
        if(!found && contentName !== '-') {
            $scope.client.basic_content.object.originalName = $scope.client.basic_content.object.name;
            $scope.client.basic_content.object.name = contentName;
            $scope.client.basic_content.$active = true;
        }
    };

    $scope.pendingVolume = 100;
    $scope.changePendingVolume = (delta) => {
        if($scope.pendingVolume + delta > 100) {
            $scope.pendingVolume = 100;
        } else if($scope.pendingVolume + delta < 0) {
            $scope.pendingVolume = 0;
        } else {
            $scope.pendingVolume += delta;
        }
        setVolume($scope.pendingVolume);
    }

    const setVolume = (volume) => {
        Restangular
            .all('client-volume-request')
            .customPOST({
                'client': $scope.client.id,
                'volume': volume
            })
            .then(
                () => {
                    Notification.info("Volume change request sent.");
                },
                () => {
                    Notification.error("Failed to change volume. Please, report this incident.");
                }
            );
    };

    $scope.activate = (content) => {
        if(content.$active || content.$flashing) {
            return;
        }
        setFlashingContent(content);
        let contentId = content.id ? content.id : content.contentId;
        Restangular
            .all('client-content-request')
            .customPOST({
                'client': $scope.client.id,
                'content': contentId
            })
            .then(
                () => {
                    let name = content.id ? content.object.name : content.value.name;
                    Notification.info(_.capitalize(name) + " pending activation.");
                },
                () => {
                    Notification.error("Failed to activate content. Please, report this incident.");
                }
            );
    };

    Restangular
        .all('client')
        .one('secret', $stateParams.loginKey)
        .get()
        .then(
            (client) => {
                let toAdd = CLIENT_CONTENTS_COUNT;
                if(client.contents !== undefined) {
                    toAdd -= client.contents.length;
                    client.contents = _.map(client.contents, (c) => {
                        if (c.content.object.route === undefined) {
                            c.content.object.route = c.content.type;
                        }
                        return { 
                            contentId: c.content.id,
                            value: c.content.object
                        }
                    });
                } else {
                    client.contents = [];
                }
                if(client.volume_request) {
                    $scope.pendingVolume = client.volume_request.volume;
                }
                $scope.client = client;
                getLastPlayerInfo();
                $interval(() => getLastPlayerInfo(), 5000);
            },
            () => {
                location.href = "https://google.com";
            }
        );
};

export default SecretController;
