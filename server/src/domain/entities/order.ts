import { z } from 'zod-http-schemas';
import { orderItemSchema } from './orderItem';
import { carrierCodeSchema, carrierQuoteSchema } from './carrierQuote';

export const orderStatus = z.enum([
  'RECEIVED',
  'QUOTED',
  'BOOKED',
  'CANCELLED',
]);

export const orderSchema = z.object({
  id: z.string().nonempty(),
  status: orderStatus,
  customer: z.string(),
  items: orderItemSchema.array(),
  carrierPricePaid: z.number().optional(),
  carrierBooked: carrierCodeSchema.optional(),
  quotes: carrierQuoteSchema.array(),
});

export const orderInputSchema = orderSchema.pick({
  id: true,
  customer: true,
  items: true,
});

export type OrderInput = z.infer<typeof orderInputSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderStatus = z.infer<typeof orderStatus>;
