const express = require("express");
const csrf = require("csurf");
const router = express.Router();

const ProductController = require('../controllers/products');

router.use(csrf());

router.get("/", ProductController.getAllProducts);
router.post("/bundle", ProductController.getProductBundles);
router.post("/add-to-cart/:id", ProductController.addProductToCart);
router.post('/addremove', ProductController.adjustProductInCart);
router.get('/deleteproduct/:id', ProductController.deleteProductFromCart);
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


module.exports = router;
