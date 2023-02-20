import json

def lambda_handler(event, context):

    sanity_blog_playload = event['Payload']
    print(sanity_blog_playload)
