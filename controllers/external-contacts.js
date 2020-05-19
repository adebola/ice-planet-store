const logger = require("../config/winston");
const Comment = require('../models/external-comments');


exports.postContact = (req, res, next) => {
  const comment = new Comment();
  
  comment.name = req.body.name;
  comment.email = req.body.email;
  comment.message = req.body.message;

  comment.save((err, result) => {

    if (err) {
      logger.error('Error Saving Comment ' + err);
      return res.status(500).json({
        type: "danger",
        message: "Error saving Comment to the database"
      });
    }

    return res.status(201).json({
      type: "success",
      message: "Thanks for your comments / enquiries, we will be in touch with you shortly"
    });
  });
}