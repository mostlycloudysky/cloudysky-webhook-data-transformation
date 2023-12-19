import json
import boto3
from opensearchpy import OpenSearch, helpers


def lambda_handler(event, context):

    domain_endpoint = "search-cloudysky-opensearch-pj37jyxci4bp3x4f2whstjdrx4.us-east-1.es.amazonaws.com"
    index = "cloudysky-cms-data"
    sanity_blog_playload = event['Payload']
    sanity_blog_title = sanity_blog_playload['title']
    sanity_blog_description = sanity_blog_playload['description']
    sanity_blog_body = sanity_blog_playload['body']
    sanity_blog_id = sanity_blog_playload['id']
    sanity_blog_categories = sanity_blog_playload['categories']
    sanity_blog_created_at = sanity_blog_playload['createdAt']
    sanity_blog_updated_at = sanity_blog_playload['updatedAt']

    categories = []
    for category in sanity_blog_categories:
        categories.append(category['title'])

    sanity_cms_data = [
        {
            "id": sanity_blog_id,
            "title": sanity_blog_title,
            "description": sanity_blog_description,
            "body": sanity_blog_body,
            "categories": categories,
            "createdAt": sanity_blog_created_at,
            "updatedAt": sanity_blog_updated_at
        }
    ]

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

    # Get connection string
    def get_connection_string():
        user = get_secrets(secret_name="os-username")['SecretString']
        password = get_secrets(secret_name="os-password")['SecretString']
        connection_string = "https://{}:{}@{}:443".format(
            user, password, domain_endpoint)
        return connection_string

    # Insert Documents
    def insert_documents(data, client, index):
        def gendata():
            for document in data:
                id = document["id"]
                yield {
                    "_id": id,
                    "_index": index,
                    "_source": document
                }
        response = helpers.bulk(client, gendata())
        print("\nIndexing Documents")
        print(response)

    # Delete Document
    def update_documents(connection_string, data, client):
        def gendata():
            for document in data:
                index_id = document["id"]
                # Delete 'id' column because we don't want to index it
                yield {
                    "_op_type": "update",
                    "_id": index_id,
                    "_index": index,
                    "doc": document,
                }
        response = helpers.bulk(client, gendata(), request_timeout=60)
        print('\nUpdating document')
        print(response)

    # Execution of the index data
    connection_string = get_connection_string()
    client = OpenSearch([connection_string])
    # Search for the document

    if document_exists := client.exists(index=index, id=sanity_blog_id):
        print("Document already exists")
        update_documents(connection_string, sanity_cms_data, client)
    else:
        print("Document does not exist")
        insert_documents(sanity_cms_data, client, index)
