import { expect } from 'chai';
import { Order } from '../../entities';
import { deriveBookCarrierOutcome } from './bookCarrier.deriver';

const mockOrder: Order = {
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
  quotes: [],
  status: 'RECEIVED',
};

describe('bookCarrier.deriver', () => {
  it('returns ORDER NOT FOUND when passed an undefined order', () => {
    const result = deriveBookCarrierOutcome(undefined, 'UPS');
    expect(result.outcome).to.eq('ORDER_NOT_FOUND');
  });
  it('returns ORDER ALREADY BOOKED when passed a booked order', () => {
    const result = deriveBookCarrierOutcome(
      {
        ...mockOrder,
        status: 'BOOKED',
      },
      'UPS'
    );
    expect(result.outcome).to.eq('ORDER_ALREADY_BOOKED');
  });
  it('returns NO MATCHING QUOTE when a quote does not exist for requested carrier', () => {
    const quotes: Order['quotes'] = [
      {
        carrier: 'FEDEX',
        priceCents: 1000,
      },
    ];
    const result = deriveBookCarrierOutcome(
      {
        ...mockOrder,
        quotes,
      },
      'UPS'
    );
    expect(result).to.deep.eq({
      outcome: 'NO_MATCHING_QUOTE',
      quotes,
    });
  });
  it('returns SUCCESS when making a valid booking', () => {
    const order: Order = {
      ...mockOrder,
      quotes: [
        {
          carrier: 'UPS',
          priceCents: 1000,
        },
      ],
    };
    const result = deriveBookCarrierOutcome(
      {
        ...order,
      },
      'UPS'
    );
    expect(result).to.deep.eq({
      outcome: 'SUCCESS',
      order: {
        ...order,
        status: 'BOOKED',
        carrierPricePaid: order.quotes[0].priceCents,
        carrierBooked: 'UPS',
      },
    });
  });
});
