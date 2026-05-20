const { User, Role, Company, Organization, Permission } = require('../../models');
const { Op } = require('sequelize');

const normalizeAuthUser = (user) => {
  if (!user) return null;

  const plain = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const role = plain.role || {};
  const company = plain.company || {};
  const organization = plain.organization || {};

  return {
    ...plain,
    first_name: plain.first_name ?? plain.firstName ?? null,
    last_name: plain.last_name ?? plain.lastName ?? null,
    organization_id: plain.organization_id ?? plain.organizationId ?? null,
    company_id: plain.company_id ?? plain.companyId ?? null,
    role_id: plain.role_id ?? plain.roleId ?? null,
    email_verified_at: plain.email_verified_at ?? plain.emailVerifiedAt ?? null,
    phone_verified_at: plain.phone_verified_at ?? plain.phoneVerifiedAt ?? null,
    last_login_at: plain.last_login_at ?? plain.lastLoginAt ?? null,
    last_login_ip: plain.last_login_ip ?? plain.lastLoginIp ?? null,
    login_attempts: plain.login_attempts ?? plain.loginAttempts ?? 0,
    locked_until: plain.locked_until ?? plain.lockedUntil ?? null,
    approval_status: plain.approval_status ?? plain.approvalStatus ?? null,
    approved_by: plain.approved_by ?? plain.approvedBy ?? null,
    approved_at: plain.approved_at ?? plain.approvedAt ?? null,
    remember_token: plain.remember_token ?? plain.rememberToken ?? null,
    password_changed_at: plain.password_changed_at ?? plain.passwordChangedAt ?? null,
    role_name: role.name || plain.role_name || null,
    role_slug: role.slug || plain.role_slug || null,
    company_name: company.name || plain.company_name || null,
    company_uuid: company.uuid || plain.company_uuid || null,
    subscription_status: company.subscription_status ?? company.subscriptionStatus ?? plain.subscription_status ?? null,
    company_status: company.status || plain.company_status || null,
    company_verified: company.is_verified ?? company.isVerified ?? plain.company_verified ?? null,
    organization_name: organization.name || plain.organization_name || null,
    organization_uuid: organization.uuid || plain.organization_uuid || null,
    organization_status: organization.status || plain.organization_status || null
  };
};

const findUserByIdentifier = async (identifier) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { username: identifier }
      ]
    },
    include: [
      { model: Role, as: 'role', attributes: ['name', 'slug'] },
      { model: Company, as: 'company', attributes: ['name', 'uuid', 'subscription_status', 'status', 'is_verified'] },
      { model: Organization, as: 'organization', attributes: ['name', 'uuid', 'status'] }
    ]
  });

  return normalizeAuthUser(user);
};

const findUserByUuid = async (uuid) => {
  const user = await User.findOne({
    where: { uuid },
    include: [
      { model: Role, as: 'role', attributes: ['name', 'slug'] },
      { model: Company, as: 'company', attributes: ['name', 'uuid', 'subscription_status', 'status', 'is_verified'] },
      { model: Organization, as: 'organization', attributes: ['name', 'uuid', 'status'] }
    ]
  });

  return normalizeAuthUser(user);
};

const findUserById = async (id) => {
  const user = await User.findByPk(id, {
    include: [
      { model: Role, as: 'role', attributes: ['name', 'slug'] },
      { model: Company, as: 'company', attributes: ['name', 'uuid', 'subscription_status', 'status', 'is_verified'] },
      { model: Organization, as: 'organization', attributes: ['name', 'uuid', 'status'] }
    ]
  });

  return normalizeAuthUser(user);
};

const getUserPermissions = async (roleId) => {
  if (!roleId) return [];

  const permissions = await Permission.findAll({
    include: [{
      model: Role,
      as: 'Roles',
      where: { id: roleId },
      through: { attributes: [] }
    }],
    order: [['group', 'ASC'], ['name', 'ASC']]
  });

  return permissions.map(p => ({
    slug: p.slug,
    name: p.name,
    group: p.group
  }));
};

const updateLastLogin = async (userId, ip) => {
  await User.update({
    lastLoginAt: new Date(),
    lastLoginIp: ip,
    loginAttempts: 0,
    lockedUntil: null
  }, {
    where: { id: userId }
  });
};

const incrementLoginAttempts = async (userId) => {
  await User.increment('loginAttempts', {
    where: { id: userId }
  });
};

const lockUserAccount = async (userId, minutes) => {
  const lockUntil = new Date();
  lockUntil.setMinutes(lockUntil.getMinutes() + minutes);

  await User.update({
    lockedUntil: lockUntil
  }, {
    where: { id: userId }
  });
};

const updatePassword = async (userId, hashedPassword) => {
  await User.update({
    password: hashedPassword,
    passwordChangedAt: new Date(),
    rememberToken: null
  }, {
    where: { id: userId }
  });
};

const storeResetToken = async (userId, hashedToken, expiresAt) => {
  await User.update({
    rememberToken: hashedToken,
    passwordChangedAt: expiresAt
  }, {
    where: { id: userId }
  });
};

const findUserByResetToken = async (hashedToken) => {
  const user = await User.findOne({
    where: {
      rememberToken: hashedToken
    },
    attributes: ['id', 'uuid', 'email', 'firstName', 'lastName', 'rememberToken', 'passwordChangedAt']
  });

  if (!user) return null;

  if (!user.passwordChangedAt || new Date(user.passwordChangedAt) <= new Date()) {
    return null;
  }

  return normalizeAuthUser(user);
};

const clearResetToken = async (userId) => {
  await User.update({
    rememberToken: null,
    passwordChangedAt: null
  }, {
    where: { id: userId }
  });
};

module.exports = {
  findUserByIdentifier,
  findUserByUuid,
  findUserById,
  getUserPermissions,
  updateLastLogin,
  incrementLoginAttempts,
  lockUserAccount,
  updatePassword,
  storeResetToken,
  findUserByResetToken,
  clearResetToken
};
