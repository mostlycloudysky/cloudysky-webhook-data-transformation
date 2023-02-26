// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
let blogData;
const AWS = require('aws-sdk');
const moment = require('moment');

exports.lambdaHandler = async (event, context) => {
  const sfnArn = process.env.StateMachineArn;
  const rightNow = moment().format('YYYYMMDD-hhmmss');
  console.log(event);

  let blog = JSON.parse(event.body);
  let blogTitle = blog.title;
  let blogDescription = blog.description;
  let blogBody = blog.body;
  let blogID = blog._id;

  const data = {
    id: blogID,
    title: blogTitle,
    description: blogDescription,
    body: blogBody,
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
