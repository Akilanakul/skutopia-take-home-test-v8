import { withAsyncErrorHandling } from './withAsyncErrorHandling';
import { carrierCodeSchema } from '../domain/entities';
import { z } from 'zod-http-schemas';
import {
  bookCarrier,
  BookCarrierResult,
} from '../domain/operations/bookCarrier';

const carrierBookingRequestSchema = z.object({
  carrier: carrierCodeSchema,
});

const urlParamsSchema = z.object({
  id: z.string().nonempty(),
});

export const handlePostOrderBookings = withAsyncErrorHandling(
  async (req, res) => {
    const bodyParseResult = carrierBookingRequestSchema.safeParse(req.body);
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
    const { carrier } = bodyParseResult.data;

    const result = await bookCarrier(orderId, carrier);

    const outcomeStatusCodeMap: Record<BookCarrierResult['outcome'], number> = {
      SUCCESS: 200,
      ORDER_ALREADY_BOOKED: 200,
      ORDER_NOT_FOUND: 404,
      NO_MATCHING_QUOTE: 400,
      INVALID_ORDER_STATUS: 400,
    };

    res.status(outcomeStatusCodeMap[result.outcome]).json(result);
  }
);
