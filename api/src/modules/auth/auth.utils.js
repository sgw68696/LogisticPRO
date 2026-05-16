const bcrypt = require('bcryptjs');
const { signAccessToken, signRefreshToken, signResetToken } = require('../../utils/jwt');
const { PASSWORD_BCRYPT_ROUNDS } = require('./auth.constants');

const hashPassword = async (password) => {
  return bcrypt.hash(password, PASSWORD_BCRYPT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const generateTokenPair = (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return { accessToken, refreshToken };
};

const generateResetToken = (userId) => {
  return signResetToken(userId);
};

const sanitizeUser = (user) => {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.remember_token;
  return sanitized;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateTokenPair,
  generateResetToken,
  sanitizeUser
};
