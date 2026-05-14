const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');

const getMe = asyncHandler(async (req, res) => {
  const data = await userService.getProfile(req.user);

  return success(res, {
    message: 'User profile structure ready',
    data
  });
});

module.exports = {
  getMe
};
