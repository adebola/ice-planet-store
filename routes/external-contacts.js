const express = require("express");
const router = express.Router();

const ContactController = require('../controllers/external-contacts');

router.post('/', ContactController.postContact);

module.exports = router;