const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const hpp = require('hpp');
const config = require('./config/env');
const requestLogger = require('./middlewares/requestLogger.middleware');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const sanitizeRequest = require('./middlewares/sanitize.middleware');
const routes = require('./routes');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(cors({ origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((origin) => origin.trim()) }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(hpp());
app.use(sanitizeRequest);
app.use(requestLogger);
app.use(rateLimiter);

app.use(config.apiBasePath, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
