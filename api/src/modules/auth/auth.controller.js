const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const { REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS } = require('./auth.constants');

const login = asyncHandler(async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const data = await authService.login(req.body, ip);

  res.cookie(REFRESH_COOKIE_NAME, data.refreshToken, REFRESH_COOKIE_OPTIONS);

  return success(res, {
    message: 'Login successful',
    data: {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth'
  });

  return success(res, {
    message: 'Logged out successfully'
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken;

  const data = await authService.refreshToken(token, ip);

  return success(res, {
    message: 'Token refreshed successfully',
    data: {
      accessToken: data.accessToken,
      user: data.user
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);

  return success(res, {
    message: 'User profile retrieved successfully',
    data
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const data = await authService.changePassword(req.user.id, req.body);

  return success(res, {
    message: data.message
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword(req.body);

  return success(res, {
    message: data.message,
    data: data.resetUrl ? { resetUrl: data.resetUrl } : undefined
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const data = await authService.resetPassword(req.body);

  return success(res, {
    message: data.message
  });
});

module.exports = {
  login,
  logout,
  refreshToken,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword
};
