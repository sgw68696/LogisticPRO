const ApiError = require('../utils/ApiError');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user && req.user.role;

    if (!role || !allowedRoles.includes(role)) {
      return next(new ApiError(403, 'You do not have permission to access this resource'));
    }

    return next();
  };
};

module.exports = authorizeRoles;
