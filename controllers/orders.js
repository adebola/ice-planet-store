const Order = require("../models/order");
const User = require("../models/user");
const logger = require("../config/winston");
const Receipt = require("../utils/receipt");
const fs = require("fs");
const request = require("request-promise");
const Cart = require('../models/cart');

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
        return res.status(201).json({
          message:
            "You don't have a valid address on your profile, please click on your name on the menu and select profile to update your address",
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
    return res.status(404).json({
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
    return res.status(404).json({
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
            logger.error("Database Error, cannot find default User");
            return res.status(500).json({
              message: "Internal Error, Please contact Ice Planet for support",
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
    return res.status(500).json({
      message:
        "User or Session Cart Not set, please re-login session might have expired",
    });
  }
};

exports.manageOrders = (req, res, next) => {
  const perPage = 10;
  const page = req.params.page || 1;

  // Load Orders from the Database

  Order.find({})
    .sort({date: -1})
    .populate("user")
    .lean()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .then((orders) => {
      Order.count().exec((err, count) => {
        if (err) {
          logger.error('Error Counting Orders in Database : ' + err);
          req.flash('Technical Error in Order::Count, Please Contact IcePlanet Support ' + err);
          return res.redirect('/orders/manage');
        }

        console.log('count is : ' + count);

        return res.render("order/orderlist", {
          orders: orders,
          current: page,
          pages: Math.ceil(count / perPage),
          csrfToken: req.csrfToken()
        });
      });
    })
    .catch((err) => {
      logger.error("Error Loading Orders ; " + err);
      req.flash(
        "err",
        "There was a network error loading orders, please contact support : " +
          err
      );
      return res.status(500).json({
        message:
          "There was a network error loading orders, please contact support : " +
          err,
      });
    });
};

exports.fulfill = (req, res, next) => {
  if (req.body && req.body.orderId) {
    Order.findOne({ _id: req.body.orderId }, (err, order) => {
      if (err) {
        logger.error(
          "Unable to retrieve Order : " + req.body.orderId + " " + err
        );
        return res.status(500).json({
          message: "Unable to retrieve Order : " + req.body.orderId,
        });
      }

      if (order.fulfilled == true) {
        logger.info("Order has already been fulfilled : " + req.body.orderId);
        return res.status(200).json({
          message: "Order has already been fulfilled : " + req.body.orderId,
        });
      }

      order.fulfilled = true;
      order
        .save()
        .then((savedOrder) => {
          logger.info("Order fulfilled " + savedOrder._id);
          return res.status(200).json({
            message: "Order fulfilled " + savedOrder._id,
          });
        })
        .catch((err) => {
          logger.error(
            "Error Saving fulfilled Order : " + req.body.orderId + " " + err
          );
          res.status(500).json({
            message: "Error Saving fulfilled Order : " + req.body.orderId,
          });
        });
    });
  } else {
    logger.error("No OrderId submitted");
    res.status(500).json({
      message: "No OrderId submitted",
    });
  }
};

exports.verifypayment = (req, res, next) => {
  if (req.body && req.body.orderId) {
    Order.findOne({ _id: req.body.orderId }, (err, order) => {
      if (err) {
        logger.error(
          "Unable to retrieve Order : " + req.body.orderId + " " + err
        );
        return res.status(500).json({
          message: "Unable to retrieve Order : " + req.body.orderId,
        });
      }

      const options = {
        url: "https://api.paystack.co/transaction/verify/" + order.paymentId,
        method: "GET",
        headers: {
          Authorization: "Bearer " + process.env.PAYSTACKSECRETKEY,
          "Content-Type": "application/json",
        },
      };

      request(options, (err, response, body) => {

        const responseMessage = JSON.parse(body);

        if (err) {
          logger.error("Error Connecting to Payment Switch: " + err);
          return res
            .status(response.statusCode)
            .json({ message: 'Error Verifying Payment ' + responseMessage.message});
        } else if (response.statusCode === 400) {
          logger.info('Payment could not be verified : ' + order._id);
          return res
          .status(response.statusCode)
          .json({message: responseMessage.message });
        } else if (!(/^2/.test('' + response.statusCode))) {
          logger.info('Payment could not be verified status code ' + response.statusCode + ' for ' + order._id);
          return res
          .status(response.statusCode)
          .json({message: 'Payment Could not be verified'});
        }

        logger.info(
          "Payment Verification Returned StatusCode : " + response.statusCode
        );

        if (response.statusCode === 200) {
          if (!order.paymentVerified) {
            order.paymentVerified = true;

            order
              .save()
              .then((savedOrder) => {
                logger.info('Order Payment Verification Status updated : ' + order._id);
              })
              .catch((err) => {
                logger.error('Internal Error updating order Verification : ' + err);
                return res
                .status(500)
                .json({message: 'Internal Error updating order verification'});
              });
          }

          return res.status(response.statusCode).json({
            message: responseMessage.message,
          });
        }
      });
    });
  } else {
    logger.error("No OrderId submitted");
    res.status(500).json({
      message: "No OrderId submitted",
    });
  }
};

exports.renderOrderDetails = (req, res, next) => {

  Order
  .findOne({_id: req.params.id})
  .populate('user')
  .lean()
  .then(order => {
    order.totalPrice = numberWithCommas(order.cart.totalPrice);
    order.delivery = order.cart.delivery;
    order.cart = new Cart(order.cart).generateArray();
    // console.log(order);
    res.render('order/orderdetail', {
      order: order,
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => {
    const msg = 'Error Loading Order : ' + req.params.id + ' from the database ' + err;
    logger.error(msg);
    req.flash('error', msg);
    return res.redirect('/orders/manage');
  });
};

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
}