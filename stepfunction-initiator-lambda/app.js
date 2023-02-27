let response;
let blogData;
const AWS = require('aws-sdk');
const moment = require('moment');
const { createClient } = require('@sanity/client');
const secretManagerClient = new AWS.SecretsManager();

exports.lambdaHandler = async (event, context) => {
  // Step Function execution section
  const sfnArn = process.env.StateMachineArn;
  const rightNow = moment().format('YYYYMMDD-hhmmss');
  console.log(event);

  let blog = JSON.parse(event.body);
  console.log(blog);
  let blogTitle = blog.title;
  let blogDescription = blog.description;
  let blogBody = blog.body;
  let blogID = blog._id;
  let blogCreatedAt = blog._createdAt;
  let blogUpdatedAt = blog._updatedAt;
  let blogMainImage = blog.mainImage;

  // Get the secret value for sanity
  const secret_name = 'sanity-cms';
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
  const SANITY_PROJECT_ID = secret.SANITY_PROJECT_ID;
  const SANITY_DATASET = secret.SANITY_DATASET;

  // Create a sanity client
  const config = {
    dataset: SANITY_DATASET,
    projectId: SANITY_PROJECT_ID,
    apiVersion: '2022-11-16',
    useCdn: false,
  };
  const client = createClient(config);

  const query = `*[_type == 'post' && _id == '${blogID}']{
    categories[] -> {
      title,
      slug
    }
  }`;

  // Get the categories
  const categories = await client.fetch(query);

  const data = {
    id: blogID,
    title: blogTitle,
    description: blogDescription,
    body: blogBody,
    categories: categories[0].categories,
    createdAt: blogCreatedAt,
    updatedAt: blogUpdatedAt,
    mainImage: blogMainImage,
  };

  const params = {
    stateMachineArn: sfnArn,
    input: JSON.stringify(data),
    name: blogID + '-' + rightNow,
  };

  const stepfunctions = new AWS.StepFunctions();
  try {
    response = await stepfunctions.startExecution(params).promise();
  } catch (err) {
    console.error(err);
  }

  return response;
};
