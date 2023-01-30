const toMarkdown = require('@sanity/block-content-to-markdown');
const AWS = require('aws-sdk');
const moment = require('moment');
const showdown = require('showdown');

exports.lambdaHandler = async (event, context) => {
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
  console.log(sanityBlogBodyHtml);
};
