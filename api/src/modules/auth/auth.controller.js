const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);

  return success(res, {
    message: 'Login structure ready',
    data
  });
});

module.exports = {
  login
};
