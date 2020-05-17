const fs = require("fs");
const AWS = require("aws-sdk");
const Product = require("../models/product");
const Cart = require("../models/cart");
const logger = require("../config/winston");

exports.getAllProducts = (req, res, next) => {
  Product.aggregate(
    [
      {
        $project: {
          _id: 1,
          imagePath: 1,
          name: 1,
          description: 1,
          category: 1,
          bundles: {
            $filter: {
              input: "$bundles",
              as: "bundle",
              cond: {
                $eq: ["$$bundle.enabled", true],
              },
            },
          },
        },
      },
    ],
    (err, products) => {
      if (err) {
        var message =
          "Error Loading Products from Database, please try refreshing the page : " +
          err.message;
        logger.error(message);
        res.render("error/error", {
          message: message,
          csrfToken: req.csrfToken(),
        });
      } else {
        var errMessage = req.query.errMessage;

        res.render("shop/index", {
          products: products,
          csrfToken: req.csrfToken(),
          errMessage: errMessage ? errMessage : null,
        });
      }
    }
  );
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
    .then((foundProduct) => {
      if (foundProduct) {
        for (var i = 0; i < foundProduct.bundles.length; i++) {
          if (foundProduct.bundles[i]._id.equals(bundleId)) {
            return res.status(201).json({
              message: "success",
              unit: foundProduct.bundles[i].unit,
              price: foundProduct.bundles[i].price,
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
    .catch((err) => {
      logger.error("router.post(/bundle) => Exception in Product.findById()");
      logger.error(err.message);
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
      foundProduct.bundles.forEach((bundle) => {
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
          var errMessage =
            "router.post(/add-to-cart/:id) => Error Saving Session : " +
            err.message;
          logger.error(errMessage);
        }
      } else {
        errMessage =
          "addProductToCart: Unable to Locate Bundle of Type: " +
          req.body.type +
          " in Product:" +
          productId;
        logger.error(errMessage);
      }
    })
    .catch((err) => {
      errMessage =
        "router.post(/add-to-cart/:id) => Exception in Product.findById() for Product: " +
        productId;
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
    item.bundles.forEach((bundle) => {
      if (bundle._id == bundleId) {
        var adjustPrice = (qty - bundle.qty) * bundle.price;

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
    item.bundles.forEach((bundle) => {
      if (bundle._id == bundleId) {
        cart.totalPrice -= bundle.subTotalPrice;
        cart.totalQty -= 1;
        bundle.qty = 0;
        bundle.subTotalPrice = 0;
      } else if (bundle.qty > 0) {
        removeProduct = false;
      }
    });

    if (removeProduct) {
      delete cart.items[productId];
    }

    console.log('CART TOTAL : ' + cart.totalQty + 'CART MONEY : ' + cart.totalPrice);
    if (cart.totalQty == 0 || cart.totalPrice == 0) {
      req.session.cart = null;
    } else {
      req.session.cart = cart;
    }


    req.session.save();
  } else {
    logger.error("router.post(/deleteproduct) => Product Not Found in Cart");
  }

  res.redirect("/products/shopping-cart");
};

exports.addDelivery = (req, res, next) => {
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.addDelivery();

  req.session.cart = cart;
  
  return res.status(200).json({
    message: 'success',
  }); 
};

exports.removeDelivery = (req, res, next) => {
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeDelivery();

  req.session.cart = cart;

  return res.status(200).json({
    message: 'success',
  }); 
};

exports.getShoppingCart = (req, res, next) => {
  if (!req.session.cart) {
    return res.render("shop/shopping-cart", {
      products: null,
      csrfToken: req.csrfToken(),
    });
  }

  var cart = new Cart(req.session.cart);

  if (cart.delivery && cart.delivery > 0) {
    cart.removeDelivery();
    req.session.cart = cart;
  }

  res.render("shop/shopping-cart", {
    products: cart.generateArray(),
    totalPrice: numberWithCommas(cart.totalPrice),
    delivery: 0,
    csrfToken: req.csrfToken(),
  });
};

exports.manageProducts = (req, res, next) => {
  const perPage = 10;
  const page = req.params.page || 1;

  Product.find({})
    .lean()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .then((products) => {
      Product.count().exec((err, count) => {
        if (err) {
          logger.error("Error Counting Products in Database : " + err);
          req.flash(
            'error',
            "Technical Error in Produc::Count, Please Contact IcePlanet Support " +
              err
          );
          return res.redirect("/products/manage");
        }

        return res.render("product/productlist", {
          products: products,
          current: page,
          pages: Math.ceil(count / perPage),
          csrfToken: req.csrfToken(),
        });
      });
    });
};

exports.renderProductDetails = (req, res, next) => {
  Product.findOne({ _id: req.params.id })
    .lean()
    .then((product) => {
      res.render("product/productdetail", {
        product: product,
        csrfToken: req.csrfToken(),
      });
    });
};

exports.updateImage = (req, res, next) => {
  if (req.file) {
    const imagePath =
      req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;

    Product.findOneAndUpdate({ _id: req.params.id }, { imagePath: imagePath })
      .then((result) => {
        return res.redirect("/products/productdetails/" + req.params.id);
      })
      .catch((err) => {
        req.flash(
          "error",
          "Error Uploading Image please ensure it is the correct format"
        );
        return res.redirect("/products/productdetails/" + req.params.id);
      });
  } else {
    req.flash("error", "Error No File to upload");
    return res.redirect("/products/productdetails/" + req.params.id);
  }
};

exports.addBundle = (req, res, next) => {
  Product.update(
    { _id: req.body._id },
    {
      $push: {
        bundles: {
          unit: req.body.bundle.unit,
          price: req.body.bundle.price,
          enabled: true,
        },
      },
    }
  )
    .then((bundle) => {
      // Find the last Inserted Bundle
      Product.findOne({ _id: req.body._id }, { bundles: { $slice: -1 } })
        .then((product) => {
          logger.info(product);
          return res.status(200).json({
            message: "success",
            bundleId: product.bundles[0]._id,
          });
        })
        .catch((err) => {
          logger.error(err);
          return res.status(400).json({
            message: err.message,
          });
        });
    })
    .catch((err) => {
      logger.error(err);
      return res.status(400).json({
        message: err.message,
      });
    });
};

exports.suspendBundle = (req, res, next) => {
  Product.update(
    { _id: req.body.productId, "bundles._id": req.body.bundleId },
    { $set: { "bundles.$.enabled": false } }
  )
    .then((val) => {
      logger.info(val);
      return res.status(200).json({
        message: "success",
      });
    })
    .catch((err) => {
      logger.error(err);
      return res.status(400).json({
        message: err.message,
      });
    });
};

exports.restoreBundle = (req, res, next) => {
  Product.update(
    { _id: req.body.productId, "bundles._id": req.body.bundleId },
    { $set: { "bundles.$.enabled": true } }
  )
    .then((val) => {
      logger.info(val);
      return res.status(200).json({
        message: "success",
      });
    })
    .catch((err) => {
      logger.error(err);
      return res.status(400).json({
        message: err.message,
      });
    });
};

exports.updateUnit = (req, res, next) => {
  Product.update(
    { _id: req.body._id, "bundles._id": req.body.bundleId },
    { $set: { "bundles.$.unit": req.body.value } }
  )
    .then((val) => {
      logger.info(val);
      return res.status(200).json({
        message: "success",
      });
    })
    .catch((err) => {
      logger.error(err);
      return res.status(400).json({
        message: err.message,
      });
    });
};

exports.updatePrice = (req, res, next) => {
  Product.update(
    { _id: req.body._id, "bundles._id": req.body.bundleId },
    { $set: { "bundles.$.price": req.body.value } }
  )
    .then((val) => {
      logger.info(val);
      return res.status(200).json({
        message: "success",
      });
    })
    .catch((err) => {
      logger.error(err);
      return res.status(400).json({
        message: err.message,
      });
    });
};

exports.updateProduct = (req, res, next) => {
  const id = req.body.productid;

  if (req.file) {
    AWS.config.setPromisesDependency();

    AWS.config.update({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
      region: "eu-west-2",
    });

    const s3 = new AWS.S3();

    const params = {
      ACL: "public-read",
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fs.createReadStream(req.file.path),
      Key: `prodimages/${req.file.filename}`,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        req.flash("error", "S3 Upload Error, please contact IcePlanet");
        logger.error("S3 Upload Error");
        logger.error(err);
        return res.redirect("/products/productdetails/" + req.body.productid);
      }

      if (data) {
        fs.unlinkSync(req.file.path);
        const locationUrl = data.Location;

        logger.info(data);

        Product.update(
          { _id: id },
          {
            $set: {
              name: req.body.name,
              category: req.body.category,
              description: req.body.description,
              imagePath: locationUrl,
            },
          }
        )
          .then((result) => {
            logger.info(result);
            req.flash("success", "Product updated Successfully");
          })
          .catch((err) => {
            logger.error(err);
            req.flash("error", "Error updating Product");
          });
      }
    });
  } else {
    Product.update(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          category: req.body.category,
          description: req.body.description,
        },
      }
    )
      .then((result) => {
        logger.info(result);
        req.flash("success", "Product updated Successfully");
      })
      .catch((err) => {
        logger.error(err);
        req.flash("error", "Error updating Product");
      });
  }

  return res.redirect("/products/productdetails/" + req.body.productid);
};

exports.renderNewProduct = (req, res, next) => {
  res.render("product/newproduct", {
    csrfToken: req.csrfToken(),
  });
};

exports.newProduct = (req, res, next) => {

  const product = new Product();
  product.name = req.body.name;
  product.category = req.body.category;
  product.description = req.body.description;
  product.imagePath = "/images/titus.jpg";

  if (req.file) {
    AWS.config.setPromisesDependency();

    AWS.config.update({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
      region: "eu-west-2",
    });

    const s3 = new AWS.S3();

    const params = {
      ACL: "public-read",
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fs.createReadStream(req.file.path),
      Key: `prodimages/${req.file.filename}`,
    };

    s3.upload(params, (err, data) => {
      
      if (err) {
        req.flash("error", "S3 Upload Error, please contact IcePlanet");
        logger.error("S3 Upload Error");
        logger.error(err);
        return res.redirect("/products/productdetails/product/new");
      }

      if (data) {
        fs.unlinkSync(req.file.path);
        product.imagePath = data.Location;
        Product.create(product)
          .then((createdProduct) => {

            logger.info(
              "Product created successfully : " + createdProduct._id
            );
            req.flash("success", "Product created successfully");
            return res.redirect(
              "/products/productdetails/" + createdProduct._id
            );
          })
          .catch((err) => {
            logger.error(err);
            req.flash("error","Product creation failed");
            return res.redirect("/products/productdetails/product/new");
          });
      } else {
        req.flash("error","S3 Data Upload Error, please contact IcePlanet");
        logger.error("S3 Data Upload Error");
        logger.error(err);
        return res.redirect("/products/productdetails/product/new");
      }
    });
  } else {
    logger.error('No File uploaded');
    req.flash('error','Please upload Product Image File');
    return res.redirect("/products/productdetails/product/new");
  }
};

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
}
