const path = require('path');
const winston = require('winston');
const config = require('./env');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: config.isProduction
      ? logFormat
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
  })
];

if (config.isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log')
    })
  );
}

const logger = winston.createLogger({
  level: config.isProduction ? 'info' : 'debug',
  defaultMeta: { service: 'logistics-saas-backend' },
  format: logFormat,
  transports,
  exitOnError: false
});

module.exports = logger;
