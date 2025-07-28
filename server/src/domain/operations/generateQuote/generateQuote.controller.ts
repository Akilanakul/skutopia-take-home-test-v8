import { ordersRepo } from '../../../repos/ordersRepo';
import { deriveGenerateQuoteOutcome, GenerateQuoteResult } from './generateQuote.deriver';
import {CarrierCode, Order} from "../../entities";

export const generateQuote = async (
    orderId: Order['id'],
    carriers: CarrierCode[]
): Promise<GenerateQuoteResult> => {
    let order: Order | undefined;

    try {
        order = await ordersRepo.getOrder(orderId);
    } catch (error) {
        return {
            outcome: 'DATABASE_ERROR',
            error: 'Failed to fetch order'
        };
    }

    const result: GenerateQuoteResult = deriveGenerateQuoteOutcome(order, carriers);

    if (result.outcome === 'SUCCESS') {
        try {
            await ordersRepo.updateOrder(result.order as Order);
        } catch (error) {
            return {
                outcome: 'DATABASE_ERROR',
                error: 'Failed to save updated order'
            };
        }
    }

    return result;
};

export { GenerateQuoteResult };