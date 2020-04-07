const express = require("express");
const csrf = require("csurf");
const router = express.Router();
const OrderController = require('../controllers/orders');

router.use(csrf());

router.post("/update", OrderController.updateOrder);
router.post("/start-transaction", OrderController.startTransaction);
router.post("/save-transaction", OrderController.saveTransaction);
router.post("/check-delivery", OrderController.checkDelivery);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.oldUrl = req.url;
  res.redirect("/users/signin");
}

module.exports = router;
