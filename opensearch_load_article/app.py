import json
import boto3


def lambda_handler(event, context):

    sanity_blog_playload = event['Payload']
    print(sanity_blog_playload)

    # Get Secret from secret manager
    def get_secrets(secret_name):
        region_name = "us-east-1"
        session = boto3.session.Session()
        client = session.client(
            service_name='secretsmanager',
            region_name=region_name
        )
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name)
        return get_secret_value_response

    # Execution steps
    user_name = get_secrets(secret_name="os-username")['SecretString']
    password = get_secrets(secret_name="os-password")['SecretString']

    print(user_name)
    print(password)
