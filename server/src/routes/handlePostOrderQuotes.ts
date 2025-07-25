import { Request, Response } from 'express';
import { z } from 'zod';
import { withAsyncErrorHandling } from './withAsyncErrorHandling';
import { carrierCodeSchema } from '../domain/entities';
import { ordersRepo } from '../repos/ordersRepo';
import {
  generateQuote
} from '../domain/operations/generateQuote';

const generateQuoteRequestSchema = z.object({
  carrier: carrierCodeSchema,
});

const urlParamsSchema = z.object({
  id: z.string().nonempty(),
});


export const handlePostOrderQuotes = withAsyncErrorHandling(async (req: Request, res: Response) => {
  const  bodyParseResult  = generateQuoteRequestSchema.safeParse(req.body);
  if (!bodyParseResult.success) {
    res.status(400).json({
      error: 'INVALID_REQUEST_BODY',
      validationError: bodyParseResult.error,
    });
    return;
  }

  const urlParamsParseResult = urlParamsSchema.safeParse(req.params);
  if (!urlParamsParseResult.success) {
    res.status(400).json({
      error: 'INVALID_URL_PARAMETER',
      validationError: urlParamsParseResult.error,
    });
    return;
  }

  const orderId = urlParamsParseResult.data.id;
  const  carriers  = bodyParseResult.data.carrier;

  const outcome = generateQuote(orderId, carriers);

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