const toMarkdown = require('@sanity/block-content-to-markdown');
const AWS = require('aws-sdk');
const moment = require('moment');
const showdown = require('showdown');
const axios = require('axios');
const aws = require('aws-sdk');
const secretManagerClient = new aws.SecretsManager();

exports.lambdaHandler = async (event, context) => {
  // Parse event data from step function
  const sanityBlog = event.Payload;
  const sanityBlogTitle = sanityBlog.title;
  const sanityBlogDescription = sanityBlog.description;
  const sanityportableText = sanityBlog.body;

  const serializers = {
    types: {
      codeBlock: (props) =>
        '```' + props.node.language + '\n' + props.node.code + '\n```',
    },
  };

  const sanityBlogBody = toMarkdown(sanityportableText, { serializers });
  let converter = new showdown.Converter();
  const sanityBlogBodyHtml = converter.makeHtml(sanityBlogBody);

  //Get the secret value for medium
  const secret_name = 'blogs-api';
  let response;
  try {
    response = await secretManagerClient
      .getSecretValue({
        SecretId: secret_name,
      })
      .promise();
  } catch (error) {
    throw error;
  }

  const secret = JSON.parse(response.SecretString);

  const HASHNODE_API_TOKEN = secret.hashnode_api_token;
  console.log(HASHNODE_API_TOKEN);

  const data = {
    query: `mutation ($input: CreateStoryInput!){
        createPublicationStory(publicationId: "63c592aacf97d7522bf68db1",input: $input){
            message
            post{
            _id
            title
            }
        }
    }`,
    variables: {
      input: {
        title: sanityBlogTitle,
        contentMarkdown: sanityBlogBody,
        tags: [
          {
            _id: '63c592aacf97d7522bf68db1',
            slug: 'AWS',
            name: 'AWS',
          },
        ],
        // coverImageURL:
        //   'https://codybontecou.com/images/header-meta-component.png',
      },
    },
  };

  const hashNodeArticleResponse = await axios.post(
    'https://api.hashnode.com',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: HASHNODE_API_TOKEN,
      },
    }
  );

  console.log(hashNodeArticleResponse);
};
