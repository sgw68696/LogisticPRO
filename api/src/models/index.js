const Organization = require('./organization.model');
const User = require('./user.model');
const Role = require('./role.model');
const Company = require('./company.model');
const CompanyType = require('./companyType.model');
const OrganizationUser = require('./organizationUser.model');
const ApprovalRequest = require('./approvalRequest.model');
const Permission = require('./permission.model');

// Organization associations
Organization.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Organization.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });
Organization.belongsTo(User, { as: 'verifier', foreignKey: 'verifiedBy' });
Organization.hasMany(Company, { foreignKey: 'organizationId', as: 'companies' });
Organization.hasMany(OrganizationUser, { foreignKey: 'organizationId', as: 'organizationUsers' });

// User associations
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
User.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });
User.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });

// Company associations
Company.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Company.belongsTo(CompanyType, { foreignKey: 'companyTypeId', as: 'companyType' });
Company.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Company.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });
Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });

// OrganizationUser associations
OrganizationUser.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
OrganizationUser.belongsTo(User, { foreignKey: 'userId', as: 'user' });
OrganizationUser.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
OrganizationUser.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });
OrganizationUser.belongsTo(User, { as: 'rejector', foreignKey: 'rejectedBy' });
OrganizationUser.belongsTo(User, { as: 'suspender', foreignKey: 'suspendedBy' });
OrganizationUser.belongsTo(User, { as: 'reactivator', foreignKey: 'reactivatedBy' });
OrganizationUser.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
OrganizationUser.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });

// ApprovalRequest associations
ApprovalRequest.belongsTo(User, { as: 'requester', foreignKey: 'requestedBy' });
ApprovalRequest.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });
ApprovalRequest.belongsTo(User, { as: 'rejector', foreignKey: 'rejectedBy' });
ApprovalRequest.belongsTo(User, { as: 'suspender', foreignKey: 'suspendedBy' });
ApprovalRequest.belongsTo(User, { as: 'reactivator', foreignKey: 'reactivatedBy' });

// Permission associations (many-to-many with Role)
Permission.belongsToMany(Role, { through: 'role_permissions', foreignKey: 'permission_id', otherKey: 'role_id' });
Role.belongsToMany(Permission, { through: 'role_permissions', foreignKey: 'role_id', otherKey: 'permission_id' });

module.exports = {
  Organization,
  User,
  Role,
  Company,
  CompanyType,
  OrganizationUser,
  ApprovalRequest,
  Permission
};
