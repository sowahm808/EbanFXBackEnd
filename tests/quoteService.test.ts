import { calculateQuote } from '../src/utils/fx';

describe('quote calculation', () => {
  it('calculates customer rate, fee, and USD amount', () => {
    const result = calculateQuote({ amountGhs: 1000, midRate: 15, spreadBps: 150, flatFeeGhs: 5, percentFeeBps: 100 });
    expect(result.customerRate).toBeCloseTo(15.225, 3);
    expect(result.feeGhs).toBe(15);
    expect(result.amountUsd).toBeCloseTo(64.7, 1);
  });
});
