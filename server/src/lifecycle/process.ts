import { cpus } from 'os';
import { logger } from '@skutopia/logger';
import { lifecycle } from './lifecycle';

const signalHandler = async (signal: NodeJS.Signals) => {
  logger.info(`${signal} called.`);
  await lifecycle.close(0);

  process.exit();
};

export const setupNodeProcess = () => {
  logger.info('node env stats', {
    availableParallelism: cpus().length,
  });
  process
    .on('SIGTERM', signalHandler)
    .on('SIGINT', signalHandler)
    .on('SIGQUIT', signalHandler);

  process
    .on('uncaughtException', async (err) => {
      logger.error('Uncaught exception:', err);
      await lifecycle.close(1);
      process.exit();
    })
    .on('unhandledRejection', async (err) => {
      logger.error('Unhandled rejection:', err);
      await lifecycle.close(1);
      process.exit();
    });
};
