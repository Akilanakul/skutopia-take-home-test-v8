import { CarrierCode, Order } from '../../entities';
import { ordersRepo } from '../../../repos/ordersRepo';
import {
    deriveGenerateQuoteOutcome,
    GenerateQuoteResult
} from './generateQuote.deriver';

export const generateQuote = async (
    orderId: Order['id'],
    carrier: CarrierCode
): Promise<GenerateQuoteResult> => {
    const existingOrder = await ordersRepo.getOrder(orderInput.id);

    const result = deriveGenerateQuoteOutcome(orderId, carrier);

    if (result.outcome === 'SUCCESS') {
        await ordersRepo.saveOrder(result.order);
    }
    return result;
};

export { GenerateQuoteResult };
