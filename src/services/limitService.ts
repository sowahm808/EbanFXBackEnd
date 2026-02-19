import { db } from '../config/firebase';
import { dateKeyAccra } from '../utils/time';

export interface LimitConfig {
  perTransactionMaxGhs: number;
  dailyMaxGhs: number;
  velocityCountLimit: number;
}

export class LimitService {
  constructor(private config: LimitConfig) {}

  async check(uid: string, amountGhs: number) {
    if (amountGhs > this.config.perTransactionMaxGhs) return { ok: false, reason: 'per-transaction limit exceeded' };
    const dayKey = dateKeyAccra();
    const dayOrders = await db.collection('paymentOrders')
      .where('uid', '==', uid)
      .where('dayKey', '==', dayKey)
      .get();
    const dailyTotal = dayOrders.docs.reduce((sum, d) => sum + Number(d.data().amountGhs || 0), 0);
    if (dailyTotal + amountGhs > this.config.dailyMaxGhs) return { ok: false, reason: 'daily limit exceeded' };
    if (dayOrders.size >= this.config.velocityCountLimit) return { ok: false, reason: 'velocity check failed' };
    return { ok: true };
  }
}
