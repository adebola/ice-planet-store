const AWS = require("aws-sdk");

module.exports = function sendMail(recipient, textBody, subject) {
  AWS.config.update({ 
    accessKeyId: 'AKIASYMXWBHN7U54JOVI',
    secretAccessKey: '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',
    region: 'us-east-1' });

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

    Source: "no-reply@factorialsystems.io",
    ReplyToAddresses: [],
  };

  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
sendPromise.then(
  function(data) {
    console.log(data.MessageId);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });
};
