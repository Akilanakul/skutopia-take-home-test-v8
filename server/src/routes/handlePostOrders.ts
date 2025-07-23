import { withAsyncErrorHandling } from './withAsyncErrorHandling';
import { createOrder } from '../domain/operations/createOrder';
import { orderInputSchema } from '../domain/entities';
import { CreateOrderResult } from '../domain/operations/createOrder';

export const handlePostOrders = withAsyncErrorHandling(
  async (req, res) => {
    const parseResult = orderInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'INVALID_REQUEST_PAYLOAD',
        validationError: parseResult.error,
      });
      return;
    }

    const result = await createOrder(parseResult.data);

    const outcomeStatusCodeMap: Record<
      CreateOrderResult['outcome'],
      number
    > = {
      SUCCESS: 200,
      ORDER_ALREADY_EXISTS: 200,
      ORDER_HAS_NO_LINE_ITEMS: 400,
    };
    res.status(outcomeStatusCodeMap[result.outcome]).json(result);
  }
);
