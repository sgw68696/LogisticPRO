const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET: 'reset'
};

const REFRESH_COOKIE_NAME = 'refreshToken';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const PASSWORD_BCRYPT_ROUNDS = 12;

const LOGIN_MAX_ATTEMPTS = 5;

const LOGIN_LOCK_DURATION_MINUTES = 15;

module.exports = {
  TOKEN_TYPES,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
  PASSWORD_BCRYPT_ROUNDS,
  LOGIN_MAX_ATTEMPTS,
  LOGIN_LOCK_DURATION_MINUTES
};
