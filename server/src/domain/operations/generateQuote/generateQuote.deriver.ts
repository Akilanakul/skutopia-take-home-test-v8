import {Order, OrderStatus, CarrierCode} from '../../entities';

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

export const deriveGenerateQuoteOutcome = (
  order: Order | undefined,
  carriers: CarrierCode[]
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

export const generateCarrierQuote = (
    order: Order,
    carrier: CarrierCode
): ShippingQuote => ({
  carrier,
  priceCents: calculateCarrierFees(carrier, order.items),
});

export type ShippingQuote = {
  carrier: CarrierCode;
  priceCents: number;
};

export const calculateCarrierFees = (
    carrier: CarrierCode,
    items: Order["items"]
): number => {
  switch (carrier) {
    case "UPS":
      return items.reduce((acc, item) => acc + item.gramsPerItem * 0.05, 800);
    case "USPS":
      return items.reduce((acc, item) => acc + item.gramsPerItem * 0.02, 1050);
    case "FEDEX":
      return items.reduce((acc, item) => acc + item.gramsPerItem * 0.03, 1000);
    default:
      throw new Error(`Unknown carrier: ${carrier}`);
  }
};