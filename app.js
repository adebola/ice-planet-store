const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const mongoStore = require("connect-mongo")(session);
const favicon = require("serve-favicon");

const config = require("./config/passport");

const indexRouter = require("./routes/index");
const userRouter = require("./routes/users");
const productRouter = require('./routes/products');

const app = express();

// const seed = require('./seed');

//mongoose
//  .connect("mongodb://localhost:27017/store", 
mongoose.connect(
  "mongodb+srv://adebola:DKHMPP7erKY5a2yB@cluster0-e6ivf.mongodb.net/store?retryWrites=true&w=majority",
  { useNewUrlParser: true,
    useUnifiedTopology: true 
  })
  .then(() => {
    console.log("Connected to Mongo Database");
  })
  .catch(err => {
    console.log("Connection Failed: " + err);
  });

  //seed();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "The Brightness of his Glory, the express image of his person",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.success = req.flash("success");
  res.locals.err = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
