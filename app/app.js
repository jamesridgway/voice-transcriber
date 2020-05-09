const express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const bodyParser = require('body-parser')

const app = new express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 
app.use(awsServerlessExpressMiddleware.eventContext());


app.get('/status', (req,res) => {
    res.send({healthy: true})
});


const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const moment = require('moment');

app.post('/recordings', (req,res) => {
    let name = req.body.name.replace(/\s/g, '-').replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '_');

    let fileName = 'uploads/' + moment().format('YYYY-MM-DDTHH-mm-ss') + '/' + req.body.name;
    let params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Expires: 3600
    }
    console.log('About to generate signed URL');
    s3.getSignedUrlPromise('putObject', params)
        .then(function (url) {
            console.log("Generated signed URL");
            res.send({upload_url: url});
        })
        .catch(function (err) {
            console.log("Error generating signed URL: ", err);
            res.send({error: err});
        });
});

module.exports = app;
