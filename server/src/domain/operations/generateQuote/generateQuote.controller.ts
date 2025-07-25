import { Request, Response } from 'express';
import { z } from 'zod';
import { withAsyncErrorHandling } from '../../../routes/withAsyncErrorHandling';
import { ordersRepo } from '../../../repos/ordersRepo';
import { generateQuote, GenerateQuoteResult } from './generateQuote.deriver';

const requestBodySchema = z.object({
  carriers: z.array(z.enum(['UPS', 'FEDEX', 'USPS'])),
});

export const generateQuoteController = withAsyncErrorHandling(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { carriers } = requestBodySchema.parse(req.body);

  const order = await ordersRepo.getOrder(id);

  const result = generateQuote(order, carriers);

  const outcomeStatusCodeMap: Record<
    GenerateQuoteResult['outcome'],
    number
  > = {
    ORDER_NOT_FOUND: 404,
    ORDER_ALREADY_BOOKED: 400,
    SUCCESS: 200,
  };

  res.status(outcomeStatusCodeMap[result.outcome]).send(result);

  if (result.outcome === 'SUCCESS') {
    await ordersRepo.updateOrder(result.order);
  }
});