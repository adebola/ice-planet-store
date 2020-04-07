const Product = require("../models/product");
const Cart = require("../models/cart");
const logger = require("../config/winston");

exports.getAllProducts = (req, res, next) => {
  Product.find({}, (err, products) => {
    if (err) {
      var message =
        "Error Loading Products from Database, please try refreshing the page : " +
        err.message;
      logger.error(message);
      res.render("error/error", {
        message: message,
        csrfToken: req.csrfToken()
      });
    } else {
      var errMessage = req.query.errMessage;

      res.render("shop/index", {
        products: products,
        csrfToken: req.csrfToken(),
        errMessage: errMessage ? errMessage : null
      });
    }
  });
};

exports.getProductBundles = (req, res, next) => {
  if (req.body) {
    productId = req.body.productId;
    bundleId = req.body.bundleId;
  } else {
    productId = req.query.productId;
    bundleId = req.query.bundleId;
  }

  Product.findById(productId)
    .then(foundProduct => {
      if (foundProduct) {
        for (var i = 0; i < foundProduct.bundles.length; i++) {
          if (foundProduct.bundles[i]._id.equals(bundleId)) {
            return res.status(201).json({
              message: "success",
              unit: foundProduct.bundles[i].unit,
              price: foundProduct.bundles[i].price
            });
          }
        }

        logger.error(
          "router.post(/bundle) => Bundle: " +
            bundleId +
            " Not Found in ProductId: " +
            productId
        );
        res.status(404).json({ message: "Bundle Not Found in Product" });
      } else {
        logger.error(
          "router.post(/bundle) => Product: " +
            productId +
            " Not Found in the Database"
        );
        res.status(404).json({ message: "Product Not Found in Database" });
      }
    })
    .catch(err => {
      log.error("router.post(/bundle) => Exception in Product.findById()");
      log.error(err.message);
      res.status(500).json({ message: "Internal Error: " + err.message });
    });
};

exports.addProductToCart = (req, res, next) => {
  var bundleId;
  var productId = req.params.id;
  var errMessage = null;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId)
    .lean()
    .then((foundProduct) => {
      foundProduct.bundles.forEach(bundle => {
        if (bundle.unit == req.body.type) {
          bundleId = bundle._id;
        }
      });

      if (bundleId) {
        cart.add(foundProduct, productId, bundleId, req.body.qty);
        req.session.cart = cart;

        try {
          req.session.save();
        } catch (err) {
          var errMessage = "router.post(/add-to-cart/:id) => Error Saving Session : " + err.message
          log.error(errMessage);
        }
      } else {
        errMessage = "addProductToCart: Unable to Locate Bundle of Type: " + req.body.type + " in Product:" + productId;
        logger.error(errMessage);
      }
    })
    .catch((err) => {
      errMessage = "router.post(/add-to-cart/:id) => Exception in Product.findById() for Product: " + productId;
      logger.error(errMessage);
      logger.error(err.message);
    });

  if (errMessage) {
    res.redirect("/products/?errMessage=" + errMessage);
  } else {
    res.redirect("/products/");
  }
};

exports.adjustProductInCart = (req, res, next) => {
  var productId = req.body.productId;
  var bundleId = req.body.bundleId;
  var qty = req.body.value;

  var cart = req.session.cart;
  var item = cart.items[productId];

  if (item) {
    item.bundles.forEach(bundle => {
      if (bundle._id == bundleId) {
        var adjustPrice = (qty - bundle.qty) * bundle.price;

        bundle.qty = qty;
        bundle.subTotalPrice += adjustPrice;
        cart.totalPrice += adjustPrice;
      }
    });

    req.session.save();
    return res.status(201).json({
      message: "success"
    });
  } else {
    logger.error(
      "router.post(/addremove) => Product: " + productId + " Not In cart"
    );
    return res.status(404).json({ message: "Product Not Found in Cart" });
  }
};

exports.deleteProductFromCart = (req, res, next) => {
  var param = req.params.id;
  var array = param.split("&");

  var productId = array[0];
  var bundleId = array[1];

  var cart = req.session.cart;
  var item = cart.items[productId];

  var removeProduct = true;

  if (item) {
    item.bundles.forEach(bundle => {
      if (bundle._id == bundleId) {
        cart.totalPrice -= bundle.subTotalPrice;
        cart.totalQty -= bundle.qty;
        bundle.qty = 0;
        bundle.subTotalPrice = 0;
      } else if (bundle.qty > 0) {
        removeProduct = false;
      }
    });

    if (removeProduct) {
      delete cart.items[productId];
    }

    req.session.save();
  } else {
    logger.error("router.post(/deleteproduct) => Product Not Found in Cart");
  }

  res.redirect("/products/shopping-cart");
};

// exports.makePayment = (req, res, next) => {
//   res.render("shop/pay", {
//     csrfToken: req.csrfToken()
//   });
// }

// exports.reportError = (req, res, next) => {
//   console.log(req.body.data);
// }

exports.getShoppingCart = (req, res, next) => {
  if (!req.session.cart) {
    return res.render("shop/shopping-cart", {
      products: null,
      csrfToken: req.csrfToken()
    });
  }

  var cart = new Cart(req.session.cart);

  res.render("shop/shopping-cart", {
    products: cart.generateArray(),
    totalPrice: numberWithCommas(cart.totalPrice),
    delivery: 0,
    csrfToken: req.csrfToken()
  });
};

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
}
