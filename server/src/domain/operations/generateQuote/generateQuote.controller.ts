import { ordersRepo } from '../../../repos/ordersRepo';
import { deriveGenerateQuoteOutcome, GenerateQuoteResult } from './generateQuote.deriver';
import {CarrierCode, Order} from "../../entities";

export const generateQuote = async (
    orderId: Order['id'],
    carriers: CarrierCode[]
): Promise<GenerateQuoteResult> => {
    const order = await ordersRepo.getOrder(orderId);

    const result =  deriveGenerateQuoteOutcome(order, carriers);

    if (result.outcome === 'SUCCESS') {
        await ordersRepo.updateOrder(result.order);
    }

    return result;
};

export { GenerateQuoteResult };