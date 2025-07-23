import { Order, OrderInput } from '../../entities';

type Success = {
  outcome: 'SUCCESS';
  order: Order;
};
type OrderAlreadyExists = {
  outcome: 'ORDER_ALREADY_EXISTS';
  order: Order;
};
type OrderHasNoLineItems = {
  outcome: 'ORDER_HAS_NO_LINE_ITEMS';
};

export type CreateOrderResult =
  | Success
  | OrderAlreadyExists
  | OrderHasNoLineItems;

export const deriveCreateOrderOutcome = (
  orderInput: OrderInput,
  existingOrder?: Order
): CreateOrderResult => {
  if (existingOrder) {
    return {
      outcome: 'ORDER_ALREADY_EXISTS',
      order: existingOrder,
    };
  }
  if (orderInput.items.length === 0) {
    return {
      outcome: 'ORDER_HAS_NO_LINE_ITEMS',
    };
  }

  return {
    outcome: 'SUCCESS',
    order: {
      ...orderInput,
      status: 'RECEIVED',
      quotes: [],
    },
  };
};
