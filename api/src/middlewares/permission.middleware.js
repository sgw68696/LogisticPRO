const ApiError = require('../utils/ApiError');
const authRepo = require('../modules/auth/auth.repository');

const hasPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(new ApiError(401, 'Authentication required'));
      }

      const user = await authRepo.findUserById(userId);

      if (!user) {
        return next(new ApiError(401, 'User not found'));
      }

      const permissions = await authRepo.getUserPermissions(user.role_id);
      const userPermissionSlugs = permissions.map(p => p.slug);

      const hasAllPermissions = requiredPermissions.every(p => userPermissionSlugs.includes(p));

      if (!hasAllPermissions) {
        return next(new ApiError(403, 'You do not have permission to perform this action'));
      }

      req.permissions = userPermissionSlugs;
      return next();
    } catch (error) {
      return next(new ApiError(500, 'Error checking permissions'));
    }
  };
};

module.exports = hasPermission;
