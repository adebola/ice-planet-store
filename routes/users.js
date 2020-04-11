const express = require("express");
const router = express.Router();
const csrf = require("csurf");
const passport = require("passport");

const UserController = require('../controllers/users')

router.use(csrf());

router.get("/profile", isLoggedIn, UserController.getProfile);
router.post("/profile", isLoggedIn, UserController.postProfile);
router.get("/signout", isLoggedIn, UserController.signOut);
router.get("/history/:page", isLoggedIn, UserController.orderHistory);

router.get("/forgotpassword", UserController.renderForgotPassword);
router.get("/forgotpassword/:token", UserController.renderResetPassword);
router.post("/forgotpassword", UserController.forgotPassword);
router.post("/changeforgotpassword/:token", UserController.changeForgotPassword);

router.get("/confirmation/:token", UserController.confirmToken);
router.get("/verify", UserController.renderVerification);
router.post("/verify", UserController.postVerification);

router.get("/signup", UserController.renderSignup);
router.get("/changepassword", isLoggedIn, UserController.renderChangePassword);
router.post("/changepassword/:userId", isLoggedIn, UserController.changePassword);
router.get('/noaccess', UserController.accessDenied);
router.use("/", notLoggedIn, UserController.defaultPage);

router.post("/signup",
  passport.authenticate("local.signup", {
    failureRedirect: "/users/signup",
    failureFlash: true
  }), UserController.postSignup);

router.get("/signin", UserController.renderSignin);

router.post(
  "/signin",
  passport.authenticate("local.signin", {
    failureRedirect: "/users/signin",
    failureFlash: true
  }),
  UserController.postSignin);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/signin");
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  res.redirect("/products");
}

module.exports = router;
