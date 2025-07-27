import { withAsyncErrorHandling } from './withAsyncErrorHandling';
import { carrierCodeSchema } from '../domain/entities';
import { z } from 'zod-http-schemas';
import {
    generateQuote
} from '../domain/operations/generateQuote';
import {GenerateQuoteResult} from "../domain/operations/generateQuote";

const urlParamsSchema = z.object({
    id: z.string().nonempty(),
});

export const carrierQuoteInputSchema = z.object({
    carriers: z.array(carrierCodeSchema)
});

export const handlePostOrderQuotes = withAsyncErrorHandling(
    async (req, res) => {
        const bodyParseResult = carrierQuoteInputSchema.safeParse(req.body);
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
        const carriers = bodyParseResult.data.carriers;

        const result = await generateQuote(orderId, carriers);

        const outcomeStatusCodeMap: Record<GenerateQuoteResult['outcome'], number> = {
            SUCCESS: 200,
            ORDER_ALREADY_BOOKED: 400,
            ORDER_NOT_FOUND: 404,
        };

       res.status(outcomeStatusCodeMap[result.outcome]).json(result);
    }
);
