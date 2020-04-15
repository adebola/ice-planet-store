const crypto = require("crypto");
const mail = require("../utils/sendmail");
const Token = require("../models/token");
const User = require("../models/user");
const Order = require("../models/order");
const logger = require("../config/winston");

exports.changePassword = (req, res, next) => {
  if (req.params.userId && req.body.password) {
    User.findById(req.params.userId)
      .then((foundUser) => {
        foundUser.encryptPassword(req.body.password, (errencrypt, hashPwd) => {
          if (errencrypt) {
            req.flash("error", "Password Encryption Error");
            logger.error(errencrypt);

            return res.redirect("/users/changepassword");
          }

          foundUser.password = hashPwd;
          foundUser
            .save()
            .then((savedUser) => {
              req.flash(
                "success",
                "Your password has been successfully changed"
              );
              return res.redirect("/users/profile");
            })
            .catch((errsave) => {
              req.flash("error", "error saving password contact Ice-Planet");
              logger.error(errsave);

              return res.redirect("/users/changepassword");
            });
        });
      })
      .catch((err) => {
        req.flash("error", "Technical Error retrieving User");
        logger.error(err);

        return res.redirect("/users/changepassword");
      });
  } else {
    req.flash("error", "No Params or Password sent in Change Password Form");
    logger.error("No Params or Password sent in Change Password Form");

    return res.redirect("/users/changepassword");
  }
};

exports.renderChangePassword = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to change password");
    return res.redirect("/users/sigin");
  }

  res.render("user/changepassword", {
    user: req.user,
    csrfToken: req.csrfToken(),
  });
};

exports.getProfile = (req, res, next) => {
  // Get Current User and send to Template to render
  if (!req.user) {
    // We really shouldnt be here, but nonetheless
    req.flash("error", "You must be logged in to view your profile");
    return res.redirect("/users/signin");
  }

  res.render("user/profile", {
    user: req.user,
    csrfToken: req.csrfToken(),
  });
};

exports.postProfile = (req, res, next) => {
  if (req.user && req.user.email) {
    User.updateOne(
      { email: req.user.email },
      {
        fullName: req.body.fullname,
        telephone: req.body.telephone,
        address: req.body.address,
      }
    )
      .then((data) => {
        req.flash("success", "Profile has been amended successfully");

        logger.info("User : " + req.user.email + " updated successfully");
        return res.redirect("/users/profile");
      })
      .catch((errMessage) => {
        console.log(errMessage);

        req.flash("error", "Error updating profile : " + errMessage);

        return res.redirect("/users/profile");
      });
  } else {
    req.flash("error", "You must be logged in to change your profile");

    return res.redirect("/users/profile");
  }

  // return res.redirect("/users/profile");
};

exports.signOut = (req, res, next) => {
  req.logout();
  req.session.cart = null;

  res.redirect("/products");
};

exports.renderForgotPassword = (req, res, next) => {
  res.render("user/forgotpassword", {
    csrfToken: req.csrfToken(),
  });
};

exports.renderResetPassword = (req, res, next) => {
  User.findOne(
    {
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gte: new Date() },
    },
    (err, foundUser) => {
      if (err) {
        req.flash(
          "error",
          "Error Locating Request Token, it has either expired or is invalid, please re-request Forgot Password"
        );
        logger.error(err);
        res.redirect("/users/signin");
      } else {
        if (foundUser) {
          res.render("user/changeforgotpwd", {
            user: foundUser,
            csrfToken: req.csrfToken(),
          });
        } else {
          req.flash(
            "error",
            "Unable to locate request token, it has either expired or is invalid, please re-request Forgot Password"
          );
          logger.error(err);
          res.redirect("/users/signin");
        }
      }
    }
  );
};

exports.changeForgotPassword = (req, res, next) => {
  if (req.params.token && req.body.password) {
    User.findOne({ passwordResetToken: req.params.token })
      .then((foundUser) => {
        foundUser.encryptPassword(req.body.password, (errencrypt, hashPwd) => {
          if (errencrypt) {
            req.flash("error", "Password Encryption Error");
            logger.error(errencrypt);

            return res.redirect("/users/forgotpassword");
          }

          foundUser.password = hashPwd;
          foundUser
            .save()
            .then((savedUser) => {
              req.flash(
                "success",
                "Your password has been successfully changed"
              );
              return res.redirect("/users/signin");
            })
            .catch((errsave) => {
              req.flash("error", "error saving password contact Ice-Planet");
              logger.error(errsave);

              return res.redirect("/users/forgotpassword");
            });
        });
      })
      .catch((errfindOne) => {
        req.flash(
          "error",
          "Token does nat match a user, unable to save password"
        );
        logger.error(errfindOne);

        res.redirect("/users/forgotpassword");
      });
  } else {
    req.flash(
      "error",
      "No Params or Password sent in Change Password Form - 2"
    );
    logger.error("No Params or Password sent in Change Password Form - 2");

    return res.redirect("/users/forgotpassword");
  }
};

exports.forgotPassword = (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, foundUser) => {
    if (err) {
      req.flash("error", "Error Finding User");
      logger.error(err);
      res.redirect("/users/forgotpassword");
    } else {
      if (foundUser) {
        if (foundUser.isVerified) {
          var token = crypto.randomBytes(16).toString("hex");

          foundUser.passwordResetToken = token;
          foundUser.passwordResetExpires = Date.now() + 3600000;

          //User.findOneAndUpdate({_id: foundUser._id}, {$set: {passwordResetToken: token, passwordResetExpires: Date.now() + 3600000}})

          foundUser
            .save((err, savedUser) => {
              if (err) {
                req.flash("error", "Internal Error saving generated token");
                logger.error(err);

                return res.redirect("/users/forgotpassword");
              }

              var text =
                "Your are receiving this because you (or someone else) has requested the reset of the password on your account.\n\n" +
                "Please click on the following link, or paste into your browser to complete the process: \n\n" +
                "https://" +
                req.headers.host +
                "/users/forgotpassword/" +
                token +
                "\n\n" +
                "If you did not request this, please ignore this email and your password will remain unchanged.\n";

              mail.sendMail(
                foundUser.email,
                text,
                "IcePlanet Store Password Reset Request"
              );
              req.flash(
                "success",
                "Password Reset request is successful, please check your e-mail and follow the instructions"
              );
              res.redirect("/users/forgotpassword");
            });
        } else {
          req.flash(
            "error",
            "Account not activated check e-mail from Ice-Planet to activate account or request for another mail"
          );
          res.redirect("/users/verify");
        }
      } else {
        req.flash(
          "error",
          "The E-mail supplied is not on our database, please signup"
        );
        res.redirect("/users/signup");
      }
    }
  });
};

exports.confirmToken = (req, res) => {
  Token.findOne({ token: req.params.token }, (err, foundToken) => {
    if (err) {
      req.flash("error", "Verification Token is invalid or has expired");
      logger.error(err.message);
      res.redirect("/users/verify");
    } else {
      if (foundToken) {
        User.findOneAndUpdate(
          { _id: foundToken._userId },
          { $set: { isVerified: true } },
          (err, Object) => {
            if (err) {
              req.flash("error", err.msg);
              logger.error("Error Updating User: " + err.msg);
              res.redirect("/users/verify");
            } else {
              req.flash(
                "success",
                "Your account has been activated Successfully, Please Login"
              );
              res.redirect("/users/signin");
            }
          }
        );
      } else {
        req.flash("error", "Verification Token is invalid or has expired");
        logger.error("Verification Token is invalid or has expired");
        res.redirect("/users/verify");
      }
    }
  });
};

exports.renderVerification = (req, res, next) => {
  res.render("user/verify", { csrfToken: req.csrfToken() });
};

exports.postVerification = (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, foundUser) => {
    if (err) {
      logger.error(err);
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
            token: crypto.randomBytes(16).toString("hex"),
          });

          token.save((err, token) => {
            if (err) {
              logger.error(
                "Unable to Create Token in Database: " + err.message
              );
              req.flash("error", err.msg);
              return res.redirect("/users/verify");
            }
          });

          var text =
            "Hello " +
            foundUser.fullName +
            "\n\nPlease activate your account by clicking the link:\nhttps://" +
            req.headers.host +
            "/users/confirmation/" +
            token.token +
            ".\n";

          mail.sendMail(foundUser.email, text, "IcePlanet Store Activation Link");

          req.flash('success', 'Verification mail sent, please check your e-mail');
          return res.redirect("/users/signin");
        }
      } else {
        logger.error("User Not Found verify:POST");
        req.flash(
          "error",
          "The E-mail supplied is not on our database, please signup"
        );
        res.redirect("/users/signup");
      }
    }
  });
};

exports.defaultPage = (req, res, next) => {
  next();
};

exports.renderSignup = (req, res) => {
  res.render("user/signup", {
    csrfToken: req.csrfToken(),
  });
};

exports.postSignup = (req, res, next) => {
  req.logOut();

  req.flash(
    "success",
    "User has been created successfully, check your e-mail to activate your account"
  );
  res.redirect("/users/signin");
};

exports.renderSignin = (req, res) => {
  res.render("user/signin", {
    csrfToken: req.csrfToken(),
  });
};

exports.postSignin = (req, res, next) => {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect("/products");
  }
};

exports.orderHistory = (req, res, next) => {
  var perPage = 10;
  var page = req.params.page || 1;

  if (!req.user) {
    return logger.error("Attempting to get Order History without Valid User");
  }

  Order.find({ user: req.user._id })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec((err, orders) => {
      Order.count().exec((err, count) => {
        if (err) {
          var errMessage = "Order.count() error: " + err.message;

          logger.error(errMessage);

          return res.render("error/error", {
            csrfToken: req.csrfToken,
            message: errMessage,
          });
        }

        res.render("user/orderhistory", {
          csrfToken: req.csrfToken,
          current: page,
          pages: Math.ceil(count / perPage),
          orders: orders,
        });
      });
    });
};

exports.accessDenied = (req, res, next) => {
  return res.render('shop/access-denied', {
    csrfToken: req.csrfToken()
  });
};
