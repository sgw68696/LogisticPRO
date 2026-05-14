const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired authentication token'));
  }
};

module.exports = authenticate;
