const authRepo = require('./auth.repository');
const authUtils = require('./auth.utils');
const { verifyToken, signAccessToken } = require('../../utils/jwt');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');
const {
  LOGIN_MAX_ATTEMPTS,
  LOGIN_LOCK_DURATION_MINUTES
} = require('./auth.constants');

const login = async ({ email, password }, ip) => {
  const user = await authRepo.findUserByIdentifier(email);

  if (!user) {
    throw new ApiError(401, 'Invalid email/username or password');
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remaining = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
    throw new ApiError(423, `Account locked. Try again in ${remaining} minute(s)`);
  }

  if (user.status !== 'active') {
    throw new ApiError(401, 'Account is inactive or suspended. Contact support');
  }

  if (user.approval_status && user.approval_status !== 'approved' && user.role_slug !== 'superadmin') {
    throw new ApiError(403, `Account is pending approval. Current status: ${user.approval_status}`);
  }

  if (user.company_id && user.company_status && user.company_status !== 'active') {
    throw new ApiError(403, 'Company account is not active. Contact support');
  }

  if (user.company_id && user.subscription_status === 'suspended') {
    throw new ApiError(403, 'Company subscription is suspended. Contact support');
  }

  if (user.organization_id && user.organization_status && user.organization_status !== 'active') {
    throw new ApiError(403, 'Organization account is not active. Contact support');
  }

  const isPasswordValid = await authUtils.comparePassword(password, user.password);

  if (!isPasswordValid) {
    const attempts = user.login_attempts + 1;
    await authRepo.incrementLoginAttempts(user.id);

    if (attempts >= LOGIN_MAX_ATTEMPTS) {
      await authRepo.lockUserAccount(user.id, LOGIN_LOCK_DURATION_MINUTES);
      logger.warn(`Account locked due to too many failed attempts`, { userId: user.id, email: user.email });
      throw new ApiError(423, `Account locked for ${LOGIN_LOCK_DURATION_MINUTES} minutes due to too many failed attempts`);
    }

    throw new ApiError(401, `Invalid email/username or password. ${LOGIN_MAX_ATTEMPTS - attempts} attempt(s) remaining`);
  }

  await authRepo.updateLastLogin(user.id, ip);

  const permissions = await authRepo.getUserPermissions(user.role_id);

  const tokenPair = authUtils.generateTokenPair(user);

  logger.info(`User logged in successfully`, { userId: user.id, email: user.email, role: user.role_slug });

  return {
    user: {
      uuid: user.uuid,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      avatar: user.avatar,
      role: user.role_slug,
      roleName: user.role_name,
      companyId: user.company_id,
      companyUuid: user.company_uuid,
      companyName: user.company_name,
      organizationId: user.organization_id,
      organizationUuid: user.organization_uuid,
      organizationName: user.organization_name,
      approvalStatus: user.approval_status,
      permissions: permissions.map(p => p.slug)
    },
    ...tokenPair
  };
};

const refreshToken = async (token, ip) => {
  if (!token) {
    throw new ApiError(400, 'Refresh token is required');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'Invalid token type');
  }

  const user = await authRepo.findUserById(payload.id);

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  if (user.status !== 'active') {
    throw new ApiError(401, 'Account is inactive or suspended');
  }

  const accessToken = signAccessToken(user);

  logger.info(`Token refreshed for user`, { userId: user.id, email: user.email });

  return {
    accessToken,
    user: {
      uuid: user.uuid,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role_slug,
      roleName: user.role_name
    }
  };
};

const getProfile = async (userId) => {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const permissions = await authRepo.getUserPermissions(user.role_id);

  return {
    uuid: user.uuid,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    username: user.username,
    avatar: user.avatar,
    status: user.status,
    emailVerified: !!user.email_verified_at,
    role: user.role_slug,
    roleName: user.role_name,
    company: user.company_id
      ? {
          id: user.company_id,
          uuid: user.company_uuid,
          name: user.company_name,
          subscriptionStatus: user.subscription_status,
          status: user.company_status,
          isVerified: !!user.company_verified
        }
      : null,
    permissions: permissions.map(p => ({
      slug: p.slug,
      name: p.name,
      group: p.group
    })),
    lastLoginAt: user.last_login_at,
    passwordChangedAt: user.password_changed_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordValid = await authUtils.comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const hashedPassword = await authUtils.hashPassword(newPassword);
  await authRepo.updatePassword(userId, hashedPassword);

  logger.info(`Password changed for user`, { userId });

  return { message: 'Password changed successfully' };
};

const forgotPassword = async ({ email }) => {
  const user = await authRepo.findUserByIdentifier(email);

  if (!user) {
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  const resetToken = authUtils.generateResetToken(user.id);

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  logger.info(`Password reset requested`, { userId: user.id, email: user.email });

  return {
    message: 'If the email exists, a password reset link has been sent',
    resetUrl
  };
};

const resetPassword = async ({ token, password }) => {
  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  if (payload.type !== 'reset') {
    throw new ApiError(400, 'Invalid token type');
  }

  const user = await authRepo.findUserById(payload.sub);

  if (!user) {
    throw new ApiError(400, 'Invalid reset token');
  }

  const hashedPassword = await authUtils.hashPassword(password);
  await authRepo.updatePassword(user.id, hashedPassword);

  logger.info(`Password reset completed`, { userId: user.id });

  return { message: 'Password has been reset successfully' };
};

module.exports = {
  login,
  refreshToken,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
