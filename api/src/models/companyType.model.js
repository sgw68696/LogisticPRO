const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/sequelize');

const CompanyType = sequelize.define('CompanyType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'company_types',
  timestamps: false
});

module.exports = CompanyType;
