import { Order, CarrierQuote, OrderStatus } from '../../entities';
import { generateQuote } from '../../../../../api-tests/util';

export const deriveGenerateQuoteOutcome = (
  order: Order | undefined,
  carriers: CarrierQuote['carrier'][]
) => {
  if (!order) {
    return { outcome: 'ORDER_NOT_FOUND' };
  }

  if (order.status === 'BOOKED') {
    return { outcome: 'ORDER_ALREADY_BOOKED' };
  }

  const quotes = carriers.map((carrier) => generateQuote(order, carrier));

  return {
    outcome: 'SUCCESS',
    order: {
      ...order,
      status: 'QUOTED' as OrderStatus,
      quotes,
    },
  };
};