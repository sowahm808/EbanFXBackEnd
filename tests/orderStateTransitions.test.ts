import { isTransitionAllowed } from '../src/services/orderService';

describe('order state transitions', () => {
  it('allows valid transitions', () => {
    expect(isTransitionAllowed('PENDING_PAYMENT', 'FUNDS_CONFIRMED')).toBe(true);
    expect(isTransitionAllowed('SENT', 'COMPLETED')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isTransitionAllowed('QUOTED', 'COMPLETED')).toBe(false);
    expect(isTransitionAllowed('FAILED', 'PROCESSING')).toBe(false);
  });
});
