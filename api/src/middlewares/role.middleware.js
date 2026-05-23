const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const ROLE_HIERARCHY = {
  superadmin: 100,
  organizationuser: 80,
  companyadmin: 60,
  companyuser: 50,
  manager: 40,
  dispatcher: 30,
  operator: 20,
  agent: 20,
  staff: 10,
  customsagent: 10,
  portagent: 10,
  customerportal: 5,
  auditorreadonly: 5
};

const authorizeRoles = (...args) => {
  const allowedRoles = args.flat();
  return (req, res, next) => {
    const role = req.user && req.user.role;

    if (!role) {
      logger.warn('Role check failed: no role in req.user', {
        user: req.user ? { id: req.user.id, email: req.user.email } : 'no user',
        allowedRoles,
      });
      return next(new ApiError(403, 'You do not have permission to access this resource'));
    }

    if (!allowedRoles.includes(role)) {
      logger.warn('Role check failed: role not allowed', {
        userRole: role,
        allowedRoles,
        userId: req.user.id,
      });
      return next(new ApiError(403, 'You do not have permission to access this resource'));
    }

    return next();
  };
};

const requireRole = authorizeRoles;

const requireMinRole = (minRole) => {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    const userLevel = ROLE_HIERARCHY[role] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;

    if (!role || userLevel < minLevel) {
      return next(new ApiError(403, 'You do not have sufficient permissions to access this resource'));
    }

    return next();
  };
};

const hasHigherRole = (roleToCompare) => {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    const userLevel = ROLE_HIERARCHY[role] || 0;
    const compareLevel = ROLE_HIERARCHY[roleToCompare] || 0;

    if (!role || userLevel <= compareLevel) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    return next();
  };
};

module.exports = {
  authorizeRoles,
  requireRole,
  requireMinRole,
  hasHigherRole,
  ROLE_HIERARCHY
};
