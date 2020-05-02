const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");
const Mail = require("../models/mail");
const logger = require("../config/winston");
const fs = require("fs");

let sendMail = function(recipient, textBody, subject) {
  AWS.config.update({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: "us-east-1",
  });

  const mailFrom = "iceplanet@factorialsystems.io";

  var params = {
    Destination: {
      ToAddresses: [recipient],
    },

    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },

      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },

    Source: mailFrom,
    ReplyToAddresses: [],
  };

  var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(function (data) {
      var mail = new Mail({
        to: recipient,
        from: mailFrom,
        content: textBody,
        subject: subject,
        mailId: data.MessageId,
      });

      mail
        .save()
        .then((newMail) => {
          console.log(data.MessageId);
        })
        .catch((err) => {
          console.log(err.message);
        });
    })
    .catch(function (err) {
      console.error(err, err.stack);
    });
};

let  sendMailWithAttachment = function (
  recipient,
  ccRecipient,
  textBody,
  subject,
  attachmentPath
) {
  AWS.config.update({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: "us-east-1",
  });

  const mailFrom = "iceplanet@factorialsystems.io";

  let transporter = nodemailer.createTransport({
    SES: new AWS.SES({ apiVersion: "2010-12-01" }),
  });

  //  Set Timeout to wait for file to be generated, otherwise empty file will be read
  setTimeout(() => {
    const data = fs.readFileSync(attachmentPath);

    transporter.sendMail(
      {
        from: mailFrom,
        to: recipient,
        cc: ccRecipient,
        subject: subject,
        text: textBody,
        attachments: [
          {
            filename: attachmentPath.split(/[\\\/]/).pop(),
            content: data,
          },
        ],
      },
      (err, info) => {
        if (err) {
          logger.error('Error sending Mail with Attachment : ' + err);
          logger.error(attachmentPath);
          logger.error(data);
          return logger.error(recipient);
        }

        logger.info('Mail with Attachment sent successfully for : ' + recipient);
        console.log(info);
      }
    );
  }, 2000);
};

module.exports = {
  sendMail: sendMail, 
  sendMailWithAttachment: sendMailWithAttachment
};
