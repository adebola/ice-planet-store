const express = require("express");
const csrf = require("csurf");
const router = express.Router();
const OrderController = require('../controllers/orders');

router.use(csrf());

router.post("/update", OrderController.updateOrder);
router.post("/start-transaction", OrderController.startTransaction);
router.post("/save-transaction", OrderController.saveTransaction);
router.post("/check-delivery", OrderController.checkDelivery);
router.get('/manage/:page', isAdminGET, OrderController.manageOrders);
router.post('/fulfill', isAdminPOST, OrderController.fulfill);
router.post('/verifypayment', isAdminPOST, OrderController.verifypayment);
router.get('/orderdetails/:id', isAdminPOST, OrderController.renderOrderDetails);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.oldUrl = req.url;
  res.redirect("/users/signin");
}

function isAdminGET(req, res, next) {
  if (req.isAuthenticated() && req.user.userType && req.user.userType === 'admin') {
    return next();
  }

  res.redirect('/users/noaccess');
}

function isAdminPOST(req, res, next) {
  if (req.isAuthenticated() && req.user.userType && req.user.userType === 'admin') {
    return next();
  }

  return res.status(403).json({
    message: 'You do not have permissions to access to the resource'
  });
}

module.exports = router;
