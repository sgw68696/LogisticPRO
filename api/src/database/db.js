const mysql = require('mysql2/promise');
const config = require('../config/env');
const logger = require('../config/logger');

const pool = mysql.createPool(config.db);

const connectDB = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    logger.info('MySQL connection established');
  } finally {
    connection.release();
  }
};

const closeDB = async () => {
  await pool.end();
  logger.info('MySQL connection pool closed');
};

module.exports = {
  pool,
  connectDB,
  closeDB
};
