const express = require("express");
const csrf = require("csurf");
const router = express.Router();
const extractFile = require('../utils/file');

const ProductController = require('../controllers/products');

router.use(csrf());


router.get("/", ProductController.getAllProducts);
router.post("/bundle", ProductController.getProductBundles);
router.post("/add-to-cart/:id", ProductController.addProductToCart);
router.post('/addremove', ProductController.adjustProductInCart);
router.get('/deleteproduct/:id', ProductController.deleteProductFromCart);
router.get('/manage/:page', isAdminGET, ProductController.manageProducts);
router.get('/productdetails/:id', isAdminGET, ProductController.renderProductDetails);
router.post('/productdetails/update',extractFile, isAdminPOST, ProductController.updateProduct)
//router.put('/productdetails/image/:id', extractFile, isAdminPOST, ProductController.updateImage);
router.post('/productdetails/bundle', isAdminPOST, ProductController.addBundle);
router.post('/productdetails/bundle/suspend', isAdminPOST, ProductController.suspendBundle);
router.post('/productdetails/bundle/restore', isAdminPOST, ProductController.restoreBundle);
router.post('/productdetails/bundle/updateunit', isAdminPOST, ProductController.updateUnit);
router.post('/productdetails/bundle/updateprice', isAdminPOST, ProductController.updatePrice);
//router.put('/productdetails/body/:id', isAdminPOST, ProductController.updateBody);
// router.get('/pay', ProductController.makePayment);
// router.post('/report', ProductController.reportError);
router.get("/shopping-cart", ProductController.getShoppingCart);

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
