var sendMail = require('./sendmail');
var sendMailWithAttachment = require('./sendmail');

sendMail('adeomoboya@gmail.com', 'Jesus Is Lord!!!', 'Subject');
sendMailWithAttachment('adeomoboya@gmail.com', 'Jesus Is Lord!!!', 'Subject', '/Users/adebola/dev/pdfs/72de159c.pdf');