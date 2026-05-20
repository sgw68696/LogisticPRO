const config = require('../config/env');
const logger = require('../config/logger');
const { error: errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : 'Internal server error';

  if (err.name === 'ValidationError' && err.details) {
    statusCode = 400;
    message = err.details[0]?.message || err.message;
  }

  const logData = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode
  };

  logger.error(err.message, logData);
  console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.originalUrl} - ${err.message}`);
  if (!config.isProduction) {
    console.error(err.stack);
  }

  return errorResponse(res, {
    statusCode,
    message,
    errors: config.isProduction ? [] : err.errors || []
  });
};

module.exports = errorHandler;
