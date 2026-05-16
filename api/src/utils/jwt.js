const jwt = require('jsonwebtoken');
const config = require('../config/env');

const signToken = (payload, expiresIn = null) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: expiresIn || config.jwt.expiresIn
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

const signAccessToken = (user) => {
  return signToken(
    {
      sub: user.uuid,
      id: user.id,
      email: user.email,
      role: user.role_slug || user.role,
      company_id: user.company_id || null,
      type: 'access'
    },
    config.jwt.expiresIn
  );
};

const signRefreshToken = (user) => {
  return signToken(
    {
      sub: user.uuid,
      id: user.id,
      type: 'refresh'
    },
    config.jwt.refreshExpiresIn
  );
};

const signResetToken = (userId) => {
  return signToken(
    {
      sub: userId,
      type: 'reset'
    },
    config.jwt.resetExpiresIn
  );
};

module.exports = {
  signToken,
  verifyToken,
  signAccessToken,
  signRefreshToken,
  signResetToken
};
