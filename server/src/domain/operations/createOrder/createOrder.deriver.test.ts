import { deriveCreateOrderOutcome } from './createOrder.deriver';
import { Order, OrderInput } from '../../entities';
import { expect } from 'chai';

const mockOrderInput: OrderInput = {
  id: '123',
  customer: 'Sally Bob',
  items: [
    {
      sku: 'SHOE-RED-1',
      quantity: 1,
      gramsPerItem: 100,
      price: 20,
    },
  ],
};

const mockOrder: Order = {
  ...mockOrderInput,
  quotes: [],
  status: 'RECEIVED',
};

describe('createOrder.deriver', () => {
  it('returns ORDER ALREADY EXISTS when an order already exists', () => {
    const result = deriveCreateOrderOutcome(mockOrderInput, mockOrder);
    expect(result.outcome).to.eq('ORDER_ALREADY_EXISTS');
  });
  it('returns ORDER HAS NO LINE ITEMS when the order has empty items array', () => {
    const result = deriveCreateOrderOutcome({
      ...mockOrderInput,
      items: [],
    });
    expect(result.outcome).to.eq('ORDER_HAS_NO_LINE_ITEMS');
  });
  it('returns SUCCESS when the order is valid', () => {
    const result = deriveCreateOrderOutcome(mockOrderInput);
    expect(result.outcome).to.eq('SUCCESS');
    // @ts-ignore
    expect(result.order).to.deep.eq(mockOrder);
  });
});
