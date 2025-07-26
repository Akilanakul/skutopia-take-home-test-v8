import {
  deriveGenerateQuoteOutcome,
  generateCarrierQuote,
  calculateCarrierFees
} from './generateQuote.deriver';
import { Order, OrderStatus, CarrierCode } from '../../entities';
import { expect } from 'chai';

describe('calculateCarrierFees', () => {
  const mockItems = [
    { sku: 'ITEM-001', quantity: 1, gramsPerItem: 100, price: 1000 },
    { sku: 'ITEM-002', quantity: 2, gramsPerItem: 200, price: 2000 }
  ];

  it('calculates UPS fees correctly', () => {
    const result = calculateCarrierFees('UPS', mockItems);
    // Base: 800 + (100 * 0.05) + (200 * 0.05) = 800 + 5 + 10 = 815
    expect(result).to.equal(815);
  });

  it('calculates USPS fees correctly', () => {
    const result = calculateCarrierFees('USPS', mockItems);
    // Base: 1050 + (100 * 0.02) + (200 * 0.02) = 1050 + 2 + 4 = 1056
    expect(result).to.equal(1056);
  });

  it('calculates FEDEX fees correctly', () => {
    const result = calculateCarrierFees('FEDEX', mockItems);
    // Base: 1000 + (100 * 0.03) + (200 * 0.03) = 1000 + 3 + 6 = 1009
    expect(result).to.equal(1009);
  });

  it('handles empty items array', () => {
    expect(calculateCarrierFees('UPS', [])).to.equal(800);
    expect(calculateCarrierFees('USPS', [])).to.equal(1050);
    expect(calculateCarrierFees('FEDEX', [])).to.equal(1000);
  });

  it('handles single item', () => {
    const singleItem = [{ sku: 'ITEM-003', quantity: 1, gramsPerItem: 150, price: 1500 }];
    expect(calculateCarrierFees('UPS', singleItem)).to.equal(807.5); // 800 + 150 * 0.05
  });

  it('throws error for unknown carrier', () => {
    expect(() => {
      calculateCarrierFees('UNKNOWN' as CarrierCode, mockItems);
    }).to.throw('Unknown carrier: UNKNOWN');
  });
});

describe('generateCarrierQuote', () => {
  const mockOrder: Order = {
    id: 'order-123',
    status: 'PENDING' as OrderStatus,
    customer: 'customer-456',
    items: [
      { sku: 'ITEM-001', quantity: 1, gramsPerItem: 100, price: 1000 },
      { sku: 'ITEM-002', quantity: 2, gramsPerItem: 200, price: 2000 }
    ],
    quotes: []
  };

  it('generates UPS quote', () => {
    const result = generateCarrierQuote(mockOrder, 'UPS');
    expect(result).to.deep.equal({
      carrier: 'UPS',
      priceCents: 815
    });
  });

  it('generates USPS quote', () => {
    const result = generateCarrierQuote(mockOrder, 'USPS');
    expect(result).to.deep.equal({
      carrier: 'USPS',
      priceCents: 1056
    });
  });

  it('generates FEDEX quote', () => {
    const result = generateCarrierQuote(mockOrder, 'FEDEX');
    expect(result).to.deep.equal({
      carrier: 'FEDEX',
      priceCents: 1009
    });
  });
});

describe('deriveGenerateQuoteOutcome', () => {
  const mockOrder: Order = {
    id: 'order-123',
    status: 'PENDING' as OrderStatus,
    customer: 'customer-456',
    items: [
      { sku: 'ITEM-001', quantity: 1, gramsPerItem: 100, price: 1000 },
      { sku: 'ITEM-002', quantity: 2, gramsPerItem: 200, price: 2000 }
    ],
    quotes: []
  };

  const carriers: CarrierCode[] = ['UPS', 'USPS', 'FEDEX'];

  describe('when order is not found', () => {
    it('returns ORDER_NOT_FOUND outcome', () => {
      const result = deriveGenerateQuoteOutcome(undefined, carriers);
      expect(result).to.deep.equal({
        outcome: 'ORDER_NOT_FOUND'
      });
    });
  });

  describe('when order is already booked', () => {
    it('returns ORDER_ALREADY_BOOKED outcome', () => {
      const bookedOrder: Order = {
        ...mockOrder,
        status: 'BOOKED' as OrderStatus
      };

      const result = deriveGenerateQuoteOutcome(bookedOrder, carriers);
      expect(result).to.deep.equal({
        outcome: 'ORDER_ALREADY_BOOKED'
      });
    });
  });

  describe('when order can be quoted', () => {
    it('returns SUCCESS with updated order and quotes', () => {
      const result = deriveGenerateQuoteOutcome(mockOrder, carriers);

      expect(result.outcome).to.equal('SUCCESS');

      if (result.outcome === 'SUCCESS') {
        expect(result.order.id).to.equal('order-123');
        expect(result.order.status).to.equal('QUOTED');
        expect(result.order.items).to.deep.equal(mockOrder.items);
        expect(result.order.quotes).to.have.lengthOf(3);

        // Verify all carriers are included
        const carrierCodes = result.order.quotes.map(q => q.carrier);
        expect(carrierCodes).to.contain('UPS');
        expect(carrierCodes).to.contain('USPS');
        expect(carrierCodes).to.contain('FEDEX');

        // Verify quote structure
        result.order.quotes.forEach(quote => {
          expect(quote).to.have.property('carrier');
          expect(quote).to.have.property('priceCents');
          expect(quote.priceCents).to.be.a('number');
          expect(quote.priceCents).to.be.greaterThan(0);
        });
      }
    });

    it('preserves original order object (immutability)', () => {
      const originalOrder = { ...mockOrder };
      deriveGenerateQuoteOutcome(mockOrder, carriers);

      // Original order should be unchanged
      expect(mockOrder).to.deep.equal(originalOrder);
      expect(mockOrder.status).to.equal('PENDING');
      expect(mockOrder.quotes).to.have.lengthOf(0); // Original should still be empty
    });

    it('handles single carrier', () => {
      const result = deriveGenerateQuoteOutcome(mockOrder, ['UPS']);

      if (result.outcome === 'SUCCESS') {
        expect(result.order.quotes).to.have.lengthOf(1);
        expect(result.order.quotes[0]).to.deep.equal({
          carrier: 'UPS',
          priceCents: 815
        });
      }
    });

    it('handles empty carriers array', () => {
      const result = deriveGenerateQuoteOutcome(mockOrder, []);

      if (result.outcome === 'SUCCESS') {
        expect(result.order.quotes).to.have.lengthOf(0);
        expect(result.order.status).to.equal('QUOTED');
      }
    });

    it('works with different order statuses (not BOOKED)', () => {
      const pendingOrder: Order = { ...mockOrder, status: 'PENDING' as OrderStatus };
      const draftOrder: Order = { ...mockOrder, status: 'DRAFT' as OrderStatus };

      expect(deriveGenerateQuoteOutcome(pendingOrder, carriers).outcome).to.equal('SUCCESS');
      expect(deriveGenerateQuoteOutcome(draftOrder, carriers).outcome).to.equal('SUCCESS');
    });
  });

  describe('edge cases', () => {
    it('handles order with no items', () => {
      const emptyOrder: Order = {
        ...mockOrder,
        items: []
      };

      const result = deriveGenerateQuoteOutcome(emptyOrder, carriers);

      if (result.outcome === 'SUCCESS') {
        expect(result.order.quotes).to.have.lengthOf(3);
        // Each quote should have base price only
        const upsQuote = result.order.quotes.find(q => q.carrier === 'UPS');
        expect(upsQuote?.priceCents).to.equal(800);
      }
    });

    it('handles order with very heavy items', () => {
      const heavyOrder: Order = {
        ...mockOrder,
        items: [{ sku: 'HEAVY-001', quantity: 1, gramsPerItem: 10000, price: 5000 }] // 10kg item
      };

      const result = deriveGenerateQuoteOutcome(heavyOrder, carriers);

      if (result.outcome === 'SUCCESS') {
        const upsQuote = result.order.quotes.find(q => q.carrier === 'UPS');
        expect(upsQuote?.priceCents).to.equal(1300); // 800 + 10000 * 0.05
      }
    });
  });

  describe('type safety', () => {
    it('result has correct discriminated union types', () => {
      const notFoundResult = deriveGenerateQuoteOutcome(undefined, carriers);
      const bookedResult = deriveGenerateQuoteOutcome({...mockOrder, status: 'BOOKED' as OrderStatus}, carriers);
      const successResult = deriveGenerateQuoteOutcome(mockOrder, carriers);

      // TypeScript should narrow types correctly
      expect(notFoundResult.outcome).to.equal('ORDER_NOT_FOUND');
      expect(bookedResult.outcome).to.equal('ORDER_ALREADY_BOOKED');
      expect(successResult.outcome).to.equal('SUCCESS');

      // These properties should only exist on SUCCESS
      if (successResult.outcome === 'SUCCESS') {
        expect(successResult.order).to.exist;
      }
    });
  });
});