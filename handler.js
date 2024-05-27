'use strict';
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app/app');
const binaryMimeTypes = [
  'audio/x-m4a'
];

const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);

module.exports.express = (event, context) => awsServerlessExpress.proxy(server, event, context);
