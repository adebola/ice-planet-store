const express = require("express");
const csrf = require("csurf");
const router = express.Router();

const Order = require("../models/order");

router.use(csrf());

router.post("/update", isLoggedIn, (req, res, next) => {
  var orderId = req.body.orderid;
  var payref = req.body.payref;

  if (orderId && payref) {
    Order.findByIdAndUpdate(orderId, {$set: {paymentId: payref}})
      .then(() =>{
        console.log("Order Updated Successfully");
        return res.status(201).json({message: "success"});
      })
      .catch((err) => {
        console.log("Error Updating Order");
        return res.status(500).json(err);
      });
  } else {
    return res.status(500).json({message: "Internal Error"});
  }
});

router.post("/start-transaction", isLoggedIn, (req, res, next) => {

  if (req.user && req.session.cart) {
    return res.status(201).json({
      email: req.user.email,
      amount: req.session.cart.totalPrice,
    });
  } else {
    return res.status(404).json({message: "User or Session not set or expired please re-LogIn and Populate the Shopping Cart"});
  }
});

router.post("/save-transaction", isLoggedIn, (req, res, next) => {
  if (req.user && req.session.cart) {
    var order = new Order({
      user: req.user,
      cart: req.session.cart,
      paymentId: req.body.payref
    });

    order
      .save()
      .then(savedOrder => {
        req.session.cart = null;
        req.session.save();

        return res.status(201).json({
          ref: savedOrder._id
        });
      })
      .catch(err => {
        return res.status(500).json(err);
      });
  } else {
    return res.status(500).json({message: "User or Session Cart Not set, please re-login session might have expired"});
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.oldUrl = req.url;
  res.redirect("/users/signin");
}

module.exports = router;
