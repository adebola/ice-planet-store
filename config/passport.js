const passport = require("passport");
const LocalStrategy = require("passport-local");
const { check, validationResult } = require("express-validator");
const crypto = require("crypto");

const User = require("../models/user");
const Token = require("../models/token");
const mail = require('../utils/sendmail');
const logger = require('../config/winston');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, email, password, done) => {
      check("email", "Invalid E-Mail").isEmail();
      check("passowrd", "Invalid E-Password").isLength({ min: 5 });

      const errors = validationResult(req);

      // var messages = [];

      if (!errors.isEmpty()) {
        req.flash("error", errors[0]);

        // errors.forEach(element => {
        //   messages.push(element.msg);
        // });

        logger.error("passport.use(local.signup) => Error : " + errors[0]);

        return done(null, false, req.flash("error", messages));
      }

      User.findOne({ email: email }, (err, user) => {
        if (err) {
          logger.error("passport.use(local.signup) => Error User.findOne: " + err.message);
          req.flash("error", err);
          return done(err);
        }

        if (user) {
          logger.info("passport.use(local.signup) => User already exists : " + user.email);
          req.flash("error", "E-mail already in use");
          return done(null, false);
        }

        var newUser = new User();
        newUser.email = email;

        newUser.encryptPassword(password, (err, hashPasswd) => {
          newUser.password = hashPasswd;
          newUser.fullName = req.body.fullname;

          if (req.body.telephone && req.body.telephone.length > 0) {
            newUser.telephoneNumber = req.body.telephone;
          }

          if (req.body.address && req.body.address.length > 0) {
            newUser.address = req.body.address;
          }

          newUser.save((err, result) => {
            if (err) {
              req.flash("error", err.msg);
              return done(err);
            }

            var token = new Token({
              _userId: newUser._id,
              token: crypto.randomBytes(16).toString("hex")
            });

            token.save((err, token) => {
              if (err) {
                logger.error("passport(local.signup) => Error Unable to Create Token in Database: " + err);
                req.flash("error", err.msg);
                return done(err);
              }

              logger.info("passport(local.signup) => NewUser : " + newUser.email + " Created Successfully");

              var text =
                "Hello " +
                newUser.fullName +
                "\n\nPlease verify your account by clicking the link:\nhttp://" +
                req.headers.host +
                "/users/confirmation/" +
                token.token +
                ".\n";

                mail.sendMail(newUser.email,text, 'IcePlanet Store Activation Link');

              // middleware.sendMail(
              //   user.username,
              //   "IcePlanet Store Activation Link",
              //   text
              // );

            });

            return done(null, newUser);
          });
        });
      });
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, email, password, done) => {
      check("email", "Invalid E-Mail").isEmail();
      check("passowrd", "Invalid E-Password").isLength({ min: 5 });

      const errors = validationResult(req);

      // var messages = [];

      if (!errors.isEmpty()) {
        req.flash("error", errors[0]);

        // errors.forEach(element => {
        //   messages.push(element.msg);
        // });

        return done(null, false);
      }

      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          req.flash("error", "User Not Found");
          return done(null, false);
        }

        if (!user.isVerified) {
          req.flash(
            "error",
            "User has not been activated, Please click on activation link sent to your mail or request for a new activation by pressing the 'SignUp' button below and then press the 'Resend Verification Mail' button in the page that displayed"
          );

          return done(null, false);
        }

        user.validPassword(password, user.password, (err, result) => {
          if (result) {
            logger.info("user: " + user.email + " logged onto the system");
            return done(null, user);
          } else {
            req.flash("error", "Wrong UserName or Password");
            return done(null, false);
          }
        });
      });
    }
  )
);
