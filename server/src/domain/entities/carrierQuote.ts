import { z } from 'zod-http-schemas';

export const carrierCodeSchema = z.enum(['UPS', 'FEDEX', 'USPS']);

export const carrierQuoteSchema = z.object({
  carrier: carrierCodeSchema,
  priceCents: z.number().int(),
});

export type CarrierCode = z.infer<typeof carrierCodeSchema>;
export type CarrierQuote = z.infer<typeof carrierQuoteSchema>;
