import { ordersRepo } from '../../../repos/ordersRepo';
import { deriveGenerateQuoteOutcome, GenerateQuoteResult } from './generateQuote.deriver';
import {CarrierCode, Order} from "../../entities";

export const generateQuote = async (
    orderId: Order['id'],
    carriers: CarrierCode[]
): Promise<GenerateQuoteResult> => {
    const order = await ordersRepo.getOrder(orderId);

    return deriveGenerateQuoteOutcome(order, carriers);
};

export { GenerateQuoteResult };