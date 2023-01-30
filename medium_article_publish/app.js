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
  console.log(secret.medium_api_token);
  console.log(typeof secret.medium_api_token);
  const MEDIUM_API_TOKEN = secret.medium_api_token;

  const postResponse = await axios.get('https://api.medium.com/v1/me', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEDIUM_API_TOKEN}`,
    },
  });

  const profileInfo = postResponse.data;
  const data = profileInfo.data;
  const mediumProfileId = data.id;

  //Post data to medium
  const createMediumArticleData = {
    title: sanityBlogTitle,
    contentFormat: 'markdown',
    content: sanityBlogBody,
    tags: ['AWS'],
    publishStatus: 'draft',
  };

  console.log(createMediumArticleData);
  console.log(typeof createMediumArticleData);

  const mediumArticleResponse = await axios.post(
    `https://api.medium.com/v1/users/${mediumProfileId}/posts`,
    createMediumArticleData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEDIUM_API_TOKEN}`,
      },
    }
  );
  console.log(mediumArticleResponse);
};
