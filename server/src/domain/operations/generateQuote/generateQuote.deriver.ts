import { Order,  OrderStatus,  CarrierCode} from '../../entities';

type Success = {
  outcome: 'SUCCESS';
  order: Order;
};
type OrderAlreadyExists = {
  outcome: 'ORDER_ALREADY_EXISTS';
  order: Order;
};

export type GenerateQuoteResult =
    | Success
    | OrderAlreadyExists;

export const deriveGenerateQuoteOutcome = (
  order: Order | undefined,
  carrier: CarrierCode
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

export const generateQuote = (
    order: orderInputSchema,
    carrier: CarrierCode
): ShippingQuote => ({
  carrier,
  priceCents: calculateCarrierFees(carrier, order.items),
});

export const calculateCarrierFees = (
    carrier: CarrierCode,
    items: SalesOrder["items"]
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