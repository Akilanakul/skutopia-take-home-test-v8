import { Order, CarrierQuote, OrderStatus } from '../../entities';
import { generateQuote as generateCarrierQuote } from '../../../../../api-tests/util';

type OrderNotFound = {
  outcome: 'ORDER_NOT_FOUND';
};

type OrderAlreadyBooked = {
  outcome: 'ORDER_ALREADY_BOOKED';
};

type Success = {
  outcome: 'SUCCESS';
  order: Order;
};

export type GenerateQuoteResult = OrderNotFound | OrderAlreadyBooked | Success;

export const generateQuote = (
  order: Order | undefined,
  carriers: CarrierQuote['carrier'][]
): GenerateQuoteResult => {
  if (!order) {
    return { outcome: 'ORDER_NOT_FOUND' };
  }

  if (order.status === 'BOOKED') {
    return { outcome: 'ORDER_ALREADY_BOOKED' };
  }

  const quotes = carriers.map((carrier) => generateCarrierQuote(order, carrier));

  return {
    outcome: 'SUCCESS',
    order: {
      ...order,
      status: 'QUOTED' as OrderStatus,
      quotes,
    },
  };
};