// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const toMarkdown = require('@sanity/block-content-to-markdown');

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

  try {
    // const ret = await axios(url);
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'hello world',
        // location: ret.data.trim()
      }),
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
