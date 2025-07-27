import {Order, OrderStatus, CarrierCode} from '../../entities';
import {config} from './config';

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
      return items.reduce((acc, item) => acc + item.gramsPerItem * config.UPS_PER_GRAM_RATE, config.UPS_BASE_RATE);
    case "USPS":
      return items.reduce((acc, item) => acc + item.gramsPerItem * config.USPS_PER_GRAM_RATE, config.USPS_BASE_RATE);
    case "FEDEX":
      return items.reduce((acc, item) => acc + item.gramsPerItem * config.FEDEX_PER_GRAM_RATE, config.FEDEX_BASE_RATE);
    default:
      throw new Error(`Unknown carrier: ${carrier}`);
  }
};