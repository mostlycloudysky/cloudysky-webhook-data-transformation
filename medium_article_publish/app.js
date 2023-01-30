const toMarkdown = require('@sanity/block-content-to-markdown');
const AWS = require('aws-sdk');
const moment = require('moment');
const showdown = require('showdown');
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
};
