const app = require('./app');
const config = require('./config/env');
const logger = require('./config/logger');
const { connectDB, closeDB } = require('./database/db');

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully`);

  if (server) {
    server.close(async () => {
      await closeDB();
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } else {
    await closeDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

startServer();
