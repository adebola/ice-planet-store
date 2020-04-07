const appRoot = require('app-root-path');
const winston = require('winston');

// instantiate a new Winston Logger with the settings defined above
var logger = new winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {service: 'iceplanet-store'},
  transports: [
    new winston.transports.File({filename: `${appRoot}/logs/appstore.log`, maxsize: 5242880, maxFiles: 20}),
    new winston.transports.File({filename: `${appRoot}/logs/error.log`, level: 'error', maxsize: 5242880, maxFiles: 20})
  ],
  exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// create a stream object with a 'write' function that will be used by morgan
logger.stream = {
  write: function (message, encoding) {

    // use the 'info' log level so the output will be picked up by both transports
    logger.info(message);
  }
};

module.exports = logger;