const Order = require("../models/order");
const User = require("../models/user");
const logger = require("../config/winston");
const Receipt = require("../utils/receipt");
const fs = require("fs");

exports.checkDelivery = (req, res, next) => {
  // Code below was used for testing of the below functionality
  // let data = fs.readFileSync('/var/folders/tv/03dfxg457c5_d3wf205x_mcw0000gn/T/055a5716.pdf');
  // console.log('data1');
  // console.log(data);
  // data = fs.readFileSync('/Users/adebola/dev/pdfs/2bc6261a.pdf');
  // console.log('data2');
  // console.log(data);

  // const receipt = new Receipt('5e8a61f150804f6b35268cb8');
  // receipt.createReceipt();

  if (req.session.cart) {
    if (req.user && req.session.cart.totalPrice > process.env.MINIMUMPRICE) {
      if (!(req.user.address && req.user.address.length > 5)) {
        return res
          .status(201)
          .jsons({
            message:
              "You dont have a valid address on your profile, please click on your name on the menu and select profile to update your address",
          });
      }

      return res.status(201).json({
        message: "OK",
      });
    } else {
      return res.status(201).json({
        message:
          "You must be loggedIn and minimum delivery order should be &#x20A6; " +
          process.env.MINIMUMPRICE,
      });
    }
  } else {
    logger.info("Unable to run checkDelivery, session may have expired");
    return res
      .status(404)
      .json({
        message:
          "User or Session not set or expired please re-LogIn and Populate the Shopping Cart",
      });
  }
};

exports.updateOrder = (req, res, next) => {
  var orderId = req.body.orderid;
  var payref = req.body.payref;

  if (orderId && payref) {
    Order.findByIdAndUpdate(orderId, { $set: { paymentId: payref } })
      .then(() => {
        return res.status(201).json({ message: "success" });
      })
      .catch((err) => {
        logger.info(
          "Error Updating Order: " + orderId + " Message:" + err.message
        );
        return res.status(500).json(err);
      });
  } else {
    logger.error("Error updating Order : " + orderId);
    return res.status(500).json({ message: "Internal Error" });
  }
};

exports.startTransaction = (req, res, next) => {
  if (req.session.cart) {
    return res.status(201).json({
      email: req.user ? req.user.email : process.env.ANONYMOUSUSER,
      amount: req.session.cart.totalPrice,
    });
  } else {
    logger.info("Unable to run startTransaction, session may have expired");
    return res
      .status(404)
      .json({
        message:
          "User or Session not set or expired please re-LogIn and Populate the Shopping Cart",
      });
  }
};

exports.saveTransaction = (req, res, next) => {
  var user = null;

  if (req.session.cart) {
    if (!req.user) {
      User.findOne(
        { email: process.env.ANONYMOUSUSER },
        (err, anonymousUser) => {
          if (err) {
            log.error("Database Error, cannot find default User");
            return req
              .status(500)
              .json({
                message:
                  "Internal Error, Please contact Ice Planet for support",
              });
          } else {
            user = anonymousUser;
          }
        }
      );
    }

    var order = new Order({
      user: req.user ? req.user : user,
      cart: req.session.cart,
      paymentId: req.body.payref,
    });

    console.log(order);

    order
      .save()
      .then((savedOrder) => {
        req.session.cart = null;
        req.session.save();

        // Only send Receipt if Customer is logged In
        if (!user) {
          const receipt = new Receipt(savedOrder._id);
          receipt.createReceipt();
        }

        return res.status(201).json({
          ref: savedOrder._id,
        });
      })
      .catch((err) => {
        logger.error("Error saving Transaction: " + err.message);
        return res.status(500).json(err);
      });
  } else {
    logger.info("Unable to run saveTransaction, session may have expired");
    return res
      .status(500)
      .json({
        message:
          "User or Session Cart Not set, please re-login session might have expired",
      });
  }
};
