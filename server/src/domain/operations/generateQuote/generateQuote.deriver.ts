import {Order, OrderStatus, CarrierCode} from '../../entities';
import {config} from './config';
import {logger} from '@skutopia/logger'

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

type QuoteGenerationFailed = {
  outcome: 'QUOTE_GENERATION_FAILED';
  error: string;
};

type DatabaseError = {
  outcome: 'DATABASE_ERROR';
  error: string;
};

export type GenerateQuoteResult =
    | OrderNotFound
    | OrderAlreadyBooked
    | Success
    | QuoteGenerationFailed
    | DatabaseError

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

  try {
    const quotes = carriers.map((carrier) => generateCarrierQuote(order, carrier));

    return {
      outcome: 'SUCCESS',
      order: {
        ...order,
        status: 'QUOTED' as OrderStatus,
        quotes,
      },
    };
  } catch (error) {
    return {
      outcome: 'QUOTE_GENERATION_FAILED',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const generateCarrierQuote = (
    order: Order,
    carrier: CarrierCode
): ShippingQuote => {
  try {
    return {
      carrier,
      priceCents: calculateCarrierFees(carrier, order.items),
    };
  } catch (error) {
    logger.error(`Error calculating fees for carrier ${carrier}:`, error);
    throw new Error(`Failed to generate quote for carrier: ${carrier}`);
  }
};

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
