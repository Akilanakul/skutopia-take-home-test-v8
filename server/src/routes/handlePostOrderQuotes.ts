import { Request, Response } from 'express';
import { z } from 'zod';
import { withAsyncErrorHandling } from './withAsyncErrorHandling';
import { ordersRepo } from '../repos/ordersRepo';
import { deriveGenerateQuoteOutcome } from '../domain/operations/generateQuote/generateQuote.deriver';

const requestBodySchema = z.object({
  carriers: z.array(z.enum(['UPS', 'FEDEX', 'USPS'])),
});

export const handlePostOrderQuotes = withAsyncErrorHandling(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { carriers } = requestBodySchema.parse(req.body);

  const order = await ordersRepo.getOrder(id);

  const outcome = deriveGenerateQuoteOutcome(order, carriers);

  switch (outcome.outcome) {
    case 'ORDER_NOT_FOUND':
      res.status(404).send({ outcome: 'ORDER_NOT_FOUND' });
      return;
    case 'ORDER_ALREADY_BOOKED':
      res.status(400).send({ outcome: 'ORDER_ALREADY_BOOKED' });
      return;
    case 'SUCCESS':
      if (outcome.order) {
        await ordersRepo.updateOrder(outcome.order);
        res.status(200).send({ outcome: 'SUCCESS', order: outcome.order });
      } else {
        throw new Error('Outcome order is undefined');
      }
      return;
    default:
      throw new Error(`Unknown outcome: ${outcome}`);
  }
});