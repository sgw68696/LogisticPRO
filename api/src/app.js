const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const config = require('./config/env');

const requestLogger = require('./middlewares/requestLogger.middleware');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const sanitizeRequest = require('./middlewares/sanitize.middleware');

const routes = require('./routes');

const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(helmet());
app.use(compression());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(cookieParser());
app.use(hpp());

app.use(sanitizeRequest);
app.use(requestLogger);
app.use(rateLimiter);

app.use(config.apiBasePath, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;