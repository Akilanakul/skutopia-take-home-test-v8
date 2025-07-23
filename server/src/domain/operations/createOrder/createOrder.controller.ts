import { OrderInput } from '../../entities';
import { ordersRepo } from '../../../repos/ordersRepo';
import {
  CreateOrderResult,
  deriveCreateOrderOutcome,
} from './createOrder.deriver';

export const createOrder = async (
  orderInput: OrderInput
): Promise<CreateOrderResult> => {
  const existingOrder = await ordersRepo.getOrder(orderInput.id);

  const result = deriveCreateOrderOutcome(orderInput, existingOrder);

  if (result.outcome === 'SUCCESS') {
    await ordersRepo.saveOrder(result.order);
  }
  return result;
};

export { CreateOrderResult };
