import { z } from 'zod';

const configSchema = z.object({
    PORT: z.coerce.number().default(8044),
    DATABASE_URL: z.string().default('postgresql://localhost:5432/skutopia'),

    // UPS rates
    UPS_BASE_RATE: z.coerce.number().default(800),
    UPS_PER_GRAM_RATE: z.coerce.number().default(0.05),

    // USPS rates
    USPS_BASE_RATE: z.coerce.number().default(1050),
    USPS_PER_GRAM_RATE: z.coerce.number().default(0.02),

    // FEDEX rates
    FEDEX_BASE_RATE: z.coerce.number().default(1000),
    FEDEX_PER_GRAM_RATE: z.coerce.number().default(0.03),

    MAX_ITEM_WEIGHT: z.coerce.number().default(50000)
});

export const config = configSchema.parse(process.env);