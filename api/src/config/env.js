const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config({ quiet: true });

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(5000),
  API_PREFIX: Joi.string().default('/api/v1'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(3306),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  DB_CONNECTION_LIMIT: Joi.number().integer().min(1).default(10),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  CORS_ORIGIN: Joi.string().default('*'),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(900000),
  RATE_LIMIT_MAX: Joi.number().integer().min(1).default(100)
})
  .unknown(true)
  .required();

const { value: envVars, error } = envSchema.validate(process.env, {
  abortEarly: false
});

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  isProduction: envVars.NODE_ENV === 'production',
  port: envVars.PORT,
  apiPrefix: envVars.API_PREFIX,
  apiBasePath: envVars.API_PREFIX.replace(/\/v\d+$/, ''),
  corsOrigin: envVars.CORS_ORIGIN,
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX
  },
  db: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    waitForConnections: true,
    connectionLimit: envVars.DB_CONNECTION_LIMIT,
    queueLimit: 0
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN
  }
};
