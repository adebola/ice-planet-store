const express = require("express");
const router = express.Router();
const csrf = require("csurf");
const passport = require("passport");
const sendMail = require("../utils/sendmail");
const Token = require("../models/token");
const User = require("../models/user");

router.use(csrf());

router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("user/profile", {
    csrfToken: req.csrfToken()
  });
});

router.get("/signout", isLoggedIn, (req, res, next) => {
  req.logout();
  res.redirect("/products");
});

router.get("/forgotpassword", (req, res, next) => {
  res.render("user/forgotpassword", {
    csrfToken: req.csrfToken()
  });
});

router.post("/forgotpassword", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, foundUser) => {
    if (err) {
      console.log(err);
      req.flash("error", err.msg);
      res.redirect("/users/forgotpassword");
    } else {
      if (foundUser) {
        if (foundUser.isVerified) {
          var token = crypto.randomBytes(16).toString("hex");
          foundUser.passwordResetToken = token;
          foundUser.passwordResetExpires = Date.now() + 3600000;

          var text =
            "Your are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste into your browser to complete the process: \n\n" +
            "http://" +
            req.headers.host +
            "/users/forgotpassword/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n";

          sendMail(
            foundUser.email,
            text,
            "IcePlanet Store Password Reset Request"
          );
          req.flash(
            "success",
            "Password Reset request successful, please check your e-mai and follow instructions"
          );
          res.redirect("/users/forgotpassword");
        } else {
          req.flash(
            "error",
            "Account not activated check e-mail from Ice-Planet to activate account or request for another mail"
          );
          res.redirect("/users/verify");
        }
      } else {
        req.flash("error", "The E-mail supplied is not on our database, please signup");
        res.redirect("/users/signup");
      }
    }
  });
});

// Handle Verification from sent e-mail
router.get("/confirmation/:token", (req, res) => {
  Token.findOne({ token: req.params.token }, (err, foundToken) => {
    if (err) {
      req.flash("error", "Verification Token is invalid or has expired");
      console.log(err);
      res.redirect("/users/verify");
    } else {
      if (foundToken) {
        User.findOneAndUpdate(
          { _id: foundToken._userId },
          { $set: { isVerified: true } },
          (err, Object) => {
            if (err) {
              req.flash("error", err.msg);
              console.log("Error Updating User: " + err.msg);
              res.redirect("/users/verify");
            } else {
              req.flash(
                "success",
                "Your account has been activated Succesfully, Please Login"
              );
              res.redirect("/users/signin");
            }
          }
        );
      } else {
        req.flash("error", "Verification Token is invalid or has expired");
        console.log(err);
        res.redirect("/users/verify");
      }
    }
  });
});

router.get("/verify", (req, res, next) => {
  res.render("user/verify", { csrfToken: req.csrfToken() });
});

router.post("/verify", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, foundUser) => {
    if (err) {
      console.log(err);
      req.flash("error", err.msg);
      res.redirect("/users/verify");
    } else {
      if (foundUser) {
        if (foundUser.isVerified) {
          req.flash("success", "Your account has already been activated");
          res.redirect("/users/signin");
        } else {
          var token = new Token({
            _userId: foundUser._id,
            token: crypto.randomBytes(16).toString("hex")
          });

          token.save((err, token) => {
            if (err) {
              console.log("Unable to Create Token in Database: " + err);
              req.flash("error", err.msg);
              return res.redirect("/users/verify");
            }
          });

          var text =
            "Hello " +
            foundUser.fullname +
            "\n\nPlease activate your account by clicking the link:\nhttp://" +
            req.headers.host +
            "/users/confirmation/" +
            token.token +
            ".\n";

          sendMail(foundUser.email, text, "IcePlanet Store Activation Link");

          return res.redirect("/users/signin");
        }
      } else {
        console.log("User Not Found verify:POST");
        req.flash("error", "The E-mail supplied is not on our database, please signup");
        res.redirect("/users/signup");
      }
    }
  });
});

router.use("/", notLoggedIn, (req, res, next) => {
  next();
});

router.get("/signup", (req, res) => {
  res.render("user/signup", {
    csrfToken: req.csrfToken()
  });
});

router.post(
  "/signup",
  passport.authenticate("local.signup", {
    failureRedirect: "/users/signup",
    failureFlash: true
  }),
  (req, res, next) => {
    req.logOut();

    req.flash(
      "success",
      "User has been created successfully, check your e-mail to activate your account"
    );
    res.redirect("/users/signin");
  }
);

router.get("/signin", (req, res) => {
  res.render("user/signin", {
    csrfToken: req.csrfToken()
  });
});

router.post(
  "/signin",
  passport.authenticate("local.signin", {
    failureRedirect: "/users/signin",
    failureFlash: true
  }),
  (req, res, next) => {
    if (req.session.oldUrl) {
      var oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect("/products");
    }
  }
);

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
