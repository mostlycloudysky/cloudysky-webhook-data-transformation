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
  console.log(sanityBlogBody);

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
  const DEVTO_API_TOKEN = secret.devto_api_key;

  //Post data to DevTo
  const createDevToArticleData = {
    article: {
      title: sanityBlogTitle,
      published: false,
      body_markdown: sanityBlogBody,
      tags: ['AWS'],
    },
  };

  const devtoArticleResponse = await axios.post(
    'https://dev.to/api/articles',
    createDevToArticleData,
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': DEVTO_API_TOKEN,
      },
    }
  );

  console.log(devtoArticleResponse);
};
