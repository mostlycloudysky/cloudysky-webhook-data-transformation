// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
let blogData;
const toMarkdown = require('@sanity/block-content-to-markdown');
const AWS = require('aws-sdk');
const moment = require('moment');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
  const sfnArn = process.env.StateMachineArn;
  const rightNow = moment().format('YYYYMMDD-hhmmss');
  console.log(event);

  let blog = JSON.parse(event.body);
  let blogTitle = blog.title;
  let blogDescription = blog.description;
  console.log('Blog Title', blogTitle);
  console.log('Blog Description', blogDescription);
  let blogBody = blog.body;
  console.log('==================');
  // console.log(JSON.stringify(blogBody));

  const serializers = {
    types: {
      codeBlock: (props) =>
        '```' + props.node.language + '\n' + props.node.code + '\n```',
    },
  };

  console.log(toMarkdown(blogBody, { serializers }));

  postData = toMarkdown(blogBody, { serializers });

  const data = {
    blogData: postData,
  };

  const params = {
    stateMachineArn: sfnArn,
    input: JSON.stringify(data),
    name: `ArchiveAt${rightNow}`,
  };

  const stepfunctions = new AWS.StepFunctions();
  try {
    response = await stepfunctions.startExecution(params).promise();
  } catch (err) {
    console.error(err);
  }

  return response;
};
