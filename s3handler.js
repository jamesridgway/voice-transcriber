'use strict';

const AWS = require('aws-sdk');
const transcribeservice = new AWS.TranscribeService();
const s3 = new AWS.S3();
const ses = new AWS.SES();

module.exports.filePut = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    for (var i = 0; i < event.Records.length; i++) {
        let fileName = decodeURIComponent(event.Records[i].s3.object.key);
        if (fileName.startsWith('uploads/')) {
            console.log("Processing uploads: ", fileName);
            let location = 's3://' + process.env.BUCKET_NAME + '/' + fileName;
            console.log(location);
            let transcribeParams = {
                LanguageCode: 'en-GB',
                Media: {
                    MediaFileUri: location
                },
                TranscriptionJobName: fileName.replace('uploads/','').replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '_'),
                OutputBucketName: process.env.BUCKET_NAME
            }
            transcribeservice.startTranscriptionJob(transcribeParams, function (err, data) {
                if (err) {
                    console.log("Error: ", err);
                    return
                }
                console.log(data);
            });
        }
        if (fileName.endsWith('.json')) {
            console.log("Processing transcript: ", fileName);
            var transcript = "";
            var getParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: fileName
            }            
            s3.getObject(getParams, function (err, data) {
                if (err) {
                    console.log("Error retrieving S3 object:" , err);
                    return
                }
                var transcriptData = JSON.parse(data.Body.toString());
                for (var transcriptIdx = 0; transcriptIdx < transcriptData.results.transcripts.length; transcriptIdx++) {
                    transcript += transcriptData.results.transcripts[transcriptIdx].transcript;
                }
                transcript += "\n\n---\n"
                transcript += "Transcript file s3://" + process.env.BUCKET_NAME + "/" + fileName
                const params = {
                    Destination: {
                        ToAddresses: [process.env.recipient]
                    },
                    Message: {
                        Body: {
                            Text: {
                                Charset: "UTF-8",
                                Data: transcript
                            }
                        },
                        Subject: {
                            Charset: 'UTF-8',
                            Data: fileName
                        }
                    },
                    Source: 'Voice Transcriber <' + process.env.sender + '>',
                };
            
                ses.sendEmail(params, (err, data) => {
                    if (err) {
                        return console.log(err, err.stack);
                    } else {
                        console.log("Email sent.", data);
                    }
                });
            })
        }
    }
};
