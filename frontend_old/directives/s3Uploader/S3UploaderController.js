import $ from 'jquery';
import md5 from 'md5';


/* @ngInject */
const S3UploaderController = 
function($scope, Restangular) {
    let processFilename = (filename) => {
        return md5(filename + new Date()) + '.' + filename.split('.').pop();
    }

    $scope.upload = (file) => {
    // Get signed request data
    Restangular
        .all('s3')
        .customPOST(
            {
                file_name: processFilename(file.name),
                file_type: file.type
            },
            'sign-upload-request'
        ).then((response) => {
            // Now we need to actually upload the file to S3
            let uploadRequestData = new FormData();
            _.each(response.data.fields, (value, field) => uploadRequestData.append(field, value));
            uploadRequestData.append('file', file);
            $.ajax({
                url: response.data.url,
                data: uploadRequestData,
                type: 'POST',
                processData: false,
                contentType: false,
                success: () => {
                    // Uploading done
                    $scope.$apply(() => $scope.model = response.url);
                }
            });
        });
    };

    $scope.reupload = () => delete $scope.model;
};

export default S3UploaderController;
