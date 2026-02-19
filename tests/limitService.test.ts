jest.mock('../src/config/firebase', () => ({
  db: {
    collection: () => ({
      where: () => ({ where: () => ({ get: async () => ({ size: 1, docs: [{ data: () => ({ amountGhs: 1000 }) }] }) }) })
    })
  }
}));

import { LimitService } from '../src/services/limitService';

describe('limit checks', () => {
  const svc = new LimitService({ perTransactionMaxGhs: 2000, dailyMaxGhs: 2500, velocityCountLimit: 3 });

  it('fails per transaction max', async () => {
    const result = await svc.check('u1', 3000);
    expect(result.ok).toBe(false);
  });

  it('passes within limits', async () => {
    const result = await svc.check('u1', 1200);
    expect(result.ok).toBe(true);
  });
});
