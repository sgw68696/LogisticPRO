const { sequelize, connectDB, closeDB } = require('./sequelize');

// Load all models and associations
require('../models');

module.exports = {
  sequelize,
  connectDB,
  closeDB
};
