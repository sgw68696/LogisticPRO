const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const ApprovalRequest = sequelize.define('ApprovalRequest', {
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
  requestType: {
    type: DataTypes.ENUM('organization', 'organization_user', 'company', 'company_user'),
    field: 'request_type',
    allowNull: false
  },
  requestId: {
    type: DataTypes.INTEGER,
    field: 'request_id',
    allowNull: false
  },
  requestedBy: {
    type: DataTypes.INTEGER,
    field: 'requested_by',
    allowNull: false
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    field: 'approval_status',
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.TEXT,
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
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deleted_at',
    allowNull: true
  }
}, {
  tableName: 'approval_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = ApprovalRequest;
