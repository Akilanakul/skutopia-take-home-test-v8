import * as fs from "fs";

export type Carrier = "UPS" | "FEDEX" | "USPS";

export type SalesOrder = {
  id: string;
  customer: string;
  items: {
    sku: string;
    price: number;
    gramsPerItem: number;
    quantity: number;
  }[];
};

export type ShippingQuote = {
  carrier: Carrier;
  priceCents: number;
};

export const loadFixture = <T>(path: string): T =>
  JSON.parse(fs.readFileSync(`${__dirname}/${path}`, "utf8"));

export const calculateCarrierFees = (
  carrier: Carrier,
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

export const generateQuote = (
  order: SalesOrder,
  carrier: Carrier
): ShippingQuote => ({
  carrier,
  priceCents: calculateCarrierFees(carrier, order.items),
});
