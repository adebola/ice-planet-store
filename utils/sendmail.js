const AWS = require("aws-sdk");
const Mail = require('../models/mail');

module.exports = function sendMail(recipient, textBody, subject) {
  AWS.config.update({ 
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: 'us-east-1' });

    const mailFrom = 'iceplanet@factorialsystems.io';

  var params = {
    Destination: {
      ToAddresses: [recipient]
    },

    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: textBody
        }
      },

      Subject: {
        Charset: "UTF-8",
        Data: subject
      }
    },

    Source: mailFrom,
    ReplyToAddresses: [],
  };

  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
sendPromise.then(
  function(data) {
    
    var mail = new Mail({
      to: recipient,
      from: mailFrom,
      content: textBody,
      subject: subject,
      mailId: data.MessageId
    });

    mail.save()
    .then((newMail) => {
      console.log(data.MessageId);
    })
    .catch((err) => {
      console.log(err.message);
    });
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });
};
