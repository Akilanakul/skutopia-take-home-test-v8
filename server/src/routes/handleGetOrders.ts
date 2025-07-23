import { withAsyncErrorHandling } from './withAsyncErrorHandling';
import { ordersRepo } from '../repos/ordersRepo';
import { orderStatus } from '../domain/entities';
import { z } from 'zod-http-schemas';

const queryParams = z.object({
  status: orderStatus.optional(),
});

export const handleGetOrders = withAsyncErrorHandling(async (req, res) => {
  const parseResult = queryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'INVALID_QUERY_PARAMETER',
      validationError: parseResult.error,
    });
    return;
  }

  const orders = await ordersRepo.getOrders(parseResult.data.status);

  res.json({ orders });
});
