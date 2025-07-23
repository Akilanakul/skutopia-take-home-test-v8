import { CarrierCode, Order } from '../../entities';

type Success = {
  outcome: 'SUCCESS';
  order: Order;
};
type NoMatchingQuote = {
  outcome: 'NO_MATCHING_QUOTE';
  quotes: Order['quotes'];
};
type InvalidOrderStatus = {
  outcome: 'INVALID_ORDER_STATUS';
  expected: 'QUOTED';
  actual: Order['status'];
};
type OrderNotFound = {
  outcome: 'ORDER_NOT_FOUND';
};
type OrderAlreadyBooked = {
  outcome: 'ORDER_ALREADY_BOOKED';
  order: Order;
};

export type BookCarrierResult =
  | Success
  | NoMatchingQuote
  | InvalidOrderStatus
  | OrderNotFound
  | OrderAlreadyBooked;

export const deriveBookCarrierOutcome = (
  order: Order | undefined,
  carrier: CarrierCode
): BookCarrierResult => {
  if (!order) {
    return {
      outcome: 'ORDER_NOT_FOUND',
    };
  }
  if (order.status === 'BOOKED') {
    return {
      outcome: 'ORDER_ALREADY_BOOKED',
      order,
    };
  }
  if (order.status !== 'QUOTED') {
    return {
      outcome: 'INVALID_ORDER_STATUS',
      expected: 'QUOTED',
      actual: order.status,
    };
  }

  const quote = order.quotes.find((q) => q.carrier === carrier);
  if (!quote) {
    return {
      outcome: 'NO_MATCHING_QUOTE',
      quotes: order.quotes,
    };
  }

  return {
    outcome: 'SUCCESS',
    order: {
      ...order,
      status: 'BOOKED',
      carrierPricePaid: quote.priceCents,
      carrierBooked: quote.carrier,
    },
  };
};
