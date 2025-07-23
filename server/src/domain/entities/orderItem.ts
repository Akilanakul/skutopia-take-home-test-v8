import { z } from 'zod-http-schemas';

export const orderItemSchema = z.object({
  sku: z.string().nonempty(),
  quantity: z.number().int().gt(0),
  gramsPerItem: z.number().int().gt(0),
  price: z.number(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
