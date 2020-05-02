const logger = require("../config/winston");
const Comment = require('../models/comment');

exports.renderContact = (req, res, next) => {
  res.render('contact/contact', {
    csrfToken: req.csrfToken()
  });
};

exports.info = (req, res, next) => {

  const comment = new Comment();
  
  comment.name = req.body.name;
  comment.email = req.body.email;
  comment.telephone = req.body.phone;
  comment.message = req.body.message;

  comment.save((err, result) => {

    if (err) {
      logger.error('Error Saving Comment ' + err);
      req.flash('error','Error Saving Comment to Database');

      return res.redirect('/contacts');
    }

    req.flash('success','Thank you for your comments we will get back to you shortly');
    return res.redirect('/contacts');
  });
};