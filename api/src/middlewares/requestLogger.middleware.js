const morgan = require('morgan');
const logger = require('../config/logger');

const stream = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim())
};

module.exports = morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream
});
