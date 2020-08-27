const express = require("express");
const csrf = require("csurf");
const router = express.Router();

const ContactController = require('../controllers/contacts');

router.use(csrf());

router.get('/', ContactController.renderContact);
router.post('/info', ContactController.info);
router.get('/about', ContactController.renderAbout);

module.exports = router;