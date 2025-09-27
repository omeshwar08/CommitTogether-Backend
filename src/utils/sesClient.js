const { SESClient } = require("@aws-sdk/client-ses");
const dotenv = require("dotenv");
dotenv.config()
// Set the AWS Region.
const REGION = "ap-south-1";
// Create SES service object.
const sesClient = new SESClient(
    {
        region: REGION,
        credentials: {
            accessKeyId: process.env.AWS_SES_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY
        },
    }
);

module.exports = sesClient;