import {withAsyncErrorHandling} from './withAsyncErrorHandling';
import {carrierCodeSchema} from '../domain/entities';
import {z} from 'zod-http-schemas';
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

        try {
            const result = await generateQuote(orderId, carriers);

            const outcomeStatusCodeMap: Record<GenerateQuoteResult['outcome'], number> = {
                SUCCESS: 200,
                ORDER_ALREADY_BOOKED: 400,
                ORDER_NOT_FOUND: 404,
                QUOTE_GENERATION_FAILED: 400,
                DATABASE_ERROR: 500,
            };

            res.status(outcomeStatusCodeMap[result.outcome]).json(result);
        } catch (error) {
            console.error('Unexpected error in generateQuote:', error);
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred while generating quotes'
            });
            return;
        }
    }
);
