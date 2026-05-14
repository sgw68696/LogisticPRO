const ApiError = require('../../utils/ApiError');
const { signToken } = require('../../utils/jwt');

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  return {
    user: {
      id: 1,
      name: 'Starter Admin',
      email,
      role: 'admin'
    },
    accessToken: signToken({ id: 1, email, role: 'admin' })
  };
};

module.exports = {
  login
};
