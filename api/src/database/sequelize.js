const { Sequelize } = require('sequelize');
const config = require('../config/env');
const logger = require('../config/logger');

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: config.isProduction ? false : (msg) => logger.debug(msg),
    pool: {
      max: config.db.connectionLimit,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Sequelize MySQL connection established');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

const closeDB = async () => {
  await sequelize.close();
  logger.info('Sequelize connection closed');
};

module.exports = {
  sequelize,
  connectDB,
  closeDB,
  Sequelize
};
