import { db } from '../config/firebase';
import { nowIso, dateKeyAccra } from '../utils/time';
import { OrderStatus } from '../models/types';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['QUOTED', 'CANCELED'],
  QUOTED: ['PENDING_PAYMENT', 'CANCELED'],
  PENDING_PAYMENT: ['FUNDS_CONFIRMED', 'CANCELED', 'FAILED'],
  FUNDS_CONFIRMED: ['PROCESSING', 'FAILED'],
  PROCESSING: ['SENT', 'FAILED'],
  SENT: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  FAILED: [],
  CANCELED: []
};

export class OrderService {
  async create(uid: string, beneficiaryId: string, quoteId: string, amountGhs: number) {
    const quoteSnap = await db.collection('quotes').doc(quoteId).get();
    if (!quoteSnap.exists) throw new Error('Quote not found');
    const quote = quoteSnap.data()!;
    if (quote.uid !== uid) throw new Error('Forbidden quote');
    if (new Date(quote.expiresAt).getTime() < Date.now()) throw new Error('Quote expired');

    const order = {
      uid,
      beneficiaryId,
      quoteId,
      amountGhs,
      amountUsd: quote.amountUsd,
      rate: quote.customerRate,
      spreadBps: quote.spreadBps,
      fees: quote.feeGhs,
      status: 'PENDING_PAYMENT' as OrderStatus,
      riskFlags: [],
      riskScore: 0,
      depositRef: null,
      settlement: null,
      payoutRef: null,
      timeline: { createdAt: nowIso(), updatedAt: nowIso(), fundsConfirmedAt: null, completedAt: null },
      dayKey: dateKeyAccra()
    };
    const ref = await db.collection('paymentOrders').add(order);
    return { id: ref.id, ...order };
  }

  async transition(orderId: string, next: OrderStatus, metadata: Record<string, unknown> = {}) {
    const ref = db.collection('paymentOrders').doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Order not found');
    const curr = snap.data()!;
    const currentStatus: OrderStatus = curr.status;
    if (!allowedTransitions[currentStatus]?.includes(next)) throw new Error(`Invalid transition ${currentStatus} -> ${next}`);

    const patch: Record<string, unknown> = { status: next, 'timeline.updatedAt': nowIso(), ...metadata };
    if (next === 'FUNDS_CONFIRMED') patch['timeline.fundsConfirmedAt'] = nowIso();
    if (next === 'COMPLETED') patch['timeline.completedAt'] = nowIso();
    await ref.update(patch);
  }
}

export const isTransitionAllowed = (from: OrderStatus, to: OrderStatus) => allowedTransitions[from].includes(to);
