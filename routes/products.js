const express = require("express");
const csrf = require("csurf");
const router = express.Router();
const Product = require("../models/product");
const Cart = require("../models/cart");
const logger = require('../config/winston');

router.use(csrf());

router.get("/", (req, res, next) => {
  Product.find({}, (err, products) => {
    if (err) {
      logger.error("Error Loading Products from Database: " + err.message);
    } else {
      res.render("shop/index", { products: products,
                                 csrfToken: req.csrfToken() });
    }
  });
});

router.post("/bundle", (req, res, next) => {
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

        logger.error("router.post(/bundle) => Bundle: " + bundleId + " Not Found in ProductId: " + productId); 
        res.status(404).json({ message: "Bundle Not Found in Product" });
      } else {
        logger.error("router.post(/bundle) => Product: " + productId + " Not Found in the Database");
        res.status(404).json({ message: "Product Not Found in Database" });
      }
    })
    .catch(err => {
      log.error("router.post(/bundle) => Exception in Product.findById()");
      log.error(err.message);
      res.status(500).json({ message: "Internal Error: " + err.message });
    });
});

router.post("/add-to-cart/:id", (req, res, next) => {
  var bundleId;
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId)
    .lean()
    .then(foundProduct => {
      foundProduct.bundles.forEach(bundle => {
        if (bundle.unit == req.body.type) {
          bundleId = bundle._id;
        }
      });

      cart.add(foundProduct, productId, bundleId, req.body.qty);
      req.session.cart = cart;

      try {
        req.session.save();
      } catch (err) {
        log.error("router.post(/add-to-cart/:id) => Error Saving Session : " + err.message);
      }
    })
    .catch(err => {
      logger.error("router.post(/add-to-cart/:id) => Exception in Product.findById() for Product: " + productId);
      logger.error(err.message);
    });

  res.redirect("/products");
});

router.post('/addremove', (req, res, next) => {
  var productId = req.body.productId;
  var bundleId = req.body.bundleId;
  var qty = req.body.value;

  var cart = req.session.cart;
  var item = cart.items[productId];

  if (item) {
    item.bundles.forEach((bundle) => {
      if (bundle._id == bundleId) {
        var adjustPrice = (qty-bundle.qty) * bundle.price;

        bundle.qty = qty;
        bundle.subTotalPrice += adjustPrice;
        cart.totalPrice += adjustPrice;
      }
    });

    req.session.save();
    return res.status(201).json({
      message: "success",
    });
  } else {
    logger.error("router.post(/addremove) => Product: " + productId + " Not In cart");
    return res.status(404).json({message: "Product Not Found in Cart"});
  }
});


router.get('/deleteproduct/:id', (req, res, next) => {
  var param = req.params.id;
  var array = param.split("&");

  var productId = array[0];
  var bundleId = array[1];

  var cart = req.session.cart;
  var item = cart.items[productId];

  var removeProduct = true;

  if (item) {
    item.bundles.forEach((bundle) => {
      if (bundle._id == bundleId) {
        cart.totalPrice -= bundle.subTotalPrice;
        cart.totalQty -= bundle.qty;
        bundle.qty = 0;
        bundle.subTotalPrice = 0;
        console.log("Found Matching Bundle");
      } else if (bundle.qty > 0) {
        removeProduct = false;
      }
    });

    if (removeProduct) {
      console.log("Will be deleteing entire Product");
      delete cart.items[productId];
    }
  }

  req.session.save();

  res.redirect('/products/shopping-cart');
});

router.get('/pay', isLoggedIn, (req, res, next) => {
  res.render("shop/pay", {
    csrfToken: req.csrfToken()
  });
});

router.post('/report', (req, res, next) => {
  console.log(req.body.data);
});

router.get("/shopping-cart", (req, res, next) => {
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
    csrfToken: req.csrfToken()
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.oldUrl = req.url;
  res.redirect("/users/signin");
}

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
      x = x.replace(pattern, "$1,$2");
  return x;
}


module.exports = router;
