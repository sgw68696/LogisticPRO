const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const OrganizationUser = sequelize.define('OrganizationUser', {
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
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: false
  },
  roleId: {
    type: DataTypes.INTEGER,
    field: 'role_id',
    allowNull: false
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    field: 'approval_status',
    defaultValue: 'pending'
  },
  isPrimaryContact: {
    type: DataTypes.BOOLEAN,
    field: 'is_primary_contact',
    defaultValue: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  jobTitle: {
    type: DataTypes.STRING,
    field: 'job_title',
    allowNull: true
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
  rejectedBy: {
    type: DataTypes.INTEGER,
    field: 'rejected_by',
    allowNull: true
  },
  rejectedAt: {
    type: DataTypes.DATE,
    field: 'rejected_at',
    allowNull: true
  },
  suspendedBy: {
    type: DataTypes.INTEGER,
    field: 'suspended_by',
    allowNull: true
  },
  suspendedAt: {
    type: DataTypes.DATE,
    field: 'suspended_at',
    allowNull: true
  },
  reactivatedBy: {
    type: DataTypes.INTEGER,
    field: 'reactivated_by',
    allowNull: true
  },
  reactivatedAt: {
    type: DataTypes.DATE,
    field: 'reactivated_at',
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason',
    allowNull: true
  },
  suspensionReason: {
    type: DataTypes.TEXT,
    field: 'suspension_reason',
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
  tableName: 'organization_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = OrganizationUser;
