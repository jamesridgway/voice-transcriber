# Voice Transcriber
Voice note transcribing service built using serverless AWS services.

Uses the [Serverless Framework](https://www.serverless.com/) to provide an API for uploading `.m4a` audio files via an AWS Lambda and API Gateway based API.

Lambda functions are used to trigger the transcription via AWS Transribe. The resultant transcript is then sent by email over SES.

## Prerequisites
This project assumes that you have a domain setup for sending email in AWS SES, and that your `RECIPIENT` address is verified to receive email from SES.

## Configuration
Create a `.env` file with the following:

    BUCKET_NAME=voice-transcriber.example.com
    DOMAIN_NAME=vt.example.com
    RECIPIENT=you@example.com
    SENDER=no-you@example.com

## Deployment

    npm i
    sls deploy
