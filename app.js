const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
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
const orderRouter = require('./routes/orders');
const contactRouter = require('./routes/contacts');
const externalContactRouter = require('./routes/external-contacts');
const logger = require('./config/winston');

const app = express();

//const enableBundles = require('./seed');
//const runReceipt = require('./test/testReceipt');

mongoose.connect(
  process.env.DATABASEURL,
  { useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.info("Connected to Mongo Database Successfully");
  })
  .catch(err => {
    logger.error("MongoDB Connection Failed: " + err.message);
  });

  //enableBundles();
  //runReceipt();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(morgan("combined"));
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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  
  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(flash());

app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use((req, res, next) => {

  console.log(req.url);

  //console.log('X-FORWARDED-PROTO : ' + req.headers['x-forwarded-proto']);

  if (process.env.NODE_ENV === 'production') {

    if (req.headers.host === 'aqueous-depths-63270.herokuapp.com') {
      return res.redirect(301, 'https://www.iceplanet.store' + req.url);
    }

    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    } 
  } 
    
  return next();
});

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/contacts", contactRouter);
app.use("/external-contacts", externalContactRouter);

app.use('*', (req, res, next) => {
  res.render('404');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.render("error/error");
});

module.exports = app;