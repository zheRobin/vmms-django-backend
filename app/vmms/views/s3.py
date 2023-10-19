import boto3
from botocore.client import Config
from rest_framework.decorators import api_view
from rest_framework.response import Response

from vmms.settings import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION


@api_view(['POST'])
def sign_upload_request(request):
    file_name = request.data.get('file_name')
    file_type = request.data.get('file_type')

    s3client = boto3.client(
        's3',
        S3_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4')
    )
    presigned_request = s3client.generate_presigned_post(
        Bucket=S3_BUCKET,
        Key=file_name,
        Fields={'acl': 'public-read', 'Content-Type': file_type},
        Conditions=[
            {'acl': 'public-read'},
            {'Content-Type': file_type}
        ],
        ExpiresIn=3600
    )

    return Response({
        'data': presigned_request,
        'url': 'https://%s.s3.amazonaws.com/%s' % (S3_BUCKET, file_name)
    })
