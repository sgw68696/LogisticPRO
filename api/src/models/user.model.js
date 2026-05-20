const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  organizationId: {
    type: DataTypes.INTEGER,
    field: 'organization_id',
    allowNull: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    field: 'company_id',
    allowNull: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    field: 'role_id',
    allowNull: true
  },
  firstName: {
    type: DataTypes.STRING,
    field: 'first_name',
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    field: 'last_name',
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    field: 'email_verified_at',
    allowNull: true
  },
  phoneVerifiedAt: {
    type: DataTypes.DATE,
    field: 'phone_verified_at',
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    field: 'last_login_at',
    allowNull: true
  },
  lastLoginIp: {
    type: DataTypes.STRING,
    field: 'last_login_ip',
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    field: 'login_attempts',
    defaultValue: 0
  },
  lockedUntil: {
    type: DataTypes.DATE,
    field: 'locked_until',
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    field: 'approval_status',
    defaultValue: 'pending'
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    field: 'approved_by',
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    field: 'approved_at',
    allowNull: true
  },
  rememberToken: {
    type: DataTypes.STRING,
    field: 'remember_token',
    allowNull: true
  },
  passwordChangedAt: {
    type: DataTypes.DATE,
    field: 'password_changed_at',
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    field: 'updated_by',
    allowNull: true
  },
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deleted_at',
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = User;
