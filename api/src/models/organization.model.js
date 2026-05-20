const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const Organization = sequelize.define('Organization', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registrationNumber: {
    type: DataTypes.STRING,
    field: 'registration_number',
    allowNull: true
  },
  taxId: {
    type: DataTypes.STRING,
    field: 'tax_id',
    allowNull: true
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
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  addressLine1: {
    type: DataTypes.STRING,
    field: 'address_line1',
    allowNull: true
  },
  addressLine2: {
    type: DataTypes.STRING,
    field: 'address_line2',
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postalCode: {
    type: DataTypes.STRING,
    field: 'postal_code',
    allowNull: true
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('trial', 'active', 'suspended', 'cancelled'),
    field: 'subscription_status',
    defaultValue: 'trial'
  },
  subscriptionStartDate: {
    type: DataTypes.DATE,
    field: 'subscription_start_date',
    allowNull: true
  },
  subscriptionEndDate: {
    type: DataTypes.DATE,
    field: 'subscription_end_date',
    allowNull: true
  },
  maxCompanies: {
    type: DataTypes.INTEGER,
    field: 'max_companies',
    defaultValue: 10
  },
  maxUsersPerCompany: {
    type: DataTypes.INTEGER,
    field: 'max_users_per_company',
    defaultValue: 50
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'suspended', 'inactive'),
    defaultValue: 'pending'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    field: 'is_verified',
    defaultValue: false
  },
  verifiedAt: {
    type: DataTypes.DATE,
    field: 'verified_at',
    allowNull: true
  },
  verifiedBy: {
    type: DataTypes.INTEGER,
    field: 'verified_by',
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
  tableName: 'organizations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Organization;
