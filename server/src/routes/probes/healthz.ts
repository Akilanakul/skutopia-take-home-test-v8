import { RequestHandler } from 'express';
import { logger } from '@skutopia/logger';
import { withAsyncErrorHandling } from '../withAsyncErrorHandling';
import { ordersRepo } from '../../repos/ordersRepo';

export const handleGetHealthz: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    try {
      // const queryResult = await pool.query(`SELECT 1`);
      const queryResult = await ordersRepo.getOrders();
      if (queryResult) {
        res.status(200).json({
          buildNumber: process.env.BUILD_NUMBER || 'local',
          commitHash: process.env.COMMIT_HASH,
        });
        return;
      }
    } catch (e) {
      logger.error(e);
    }
    res.sendStatus(500);
  }
);
