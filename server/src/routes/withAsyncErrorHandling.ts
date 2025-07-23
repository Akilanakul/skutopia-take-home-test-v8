import { RequestHandler } from 'express';
import { logger } from '@skutopia/logger';

export const withAsyncErrorHandling =
  (
    // Using any because the only consumer of this type is Express, so although not ideal, it doesn't do any harm
    handler: (req: any, res: any, next: any) => void
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      logger.error(e);
      res.sendStatus(500);
    }
  };
