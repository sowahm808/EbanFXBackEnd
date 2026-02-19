"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransitionAllowed = exports.OrderService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const allowedTransitions = {
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
class OrderService {
    async create(uid, beneficiaryId, quoteId, amountGhs) {
        const quoteSnap = await firebase_1.db.collection('quotes').doc(quoteId).get();
        if (!quoteSnap.exists)
            throw new Error('Quote not found');
        const quote = quoteSnap.data();
        if (quote.uid !== uid)
            throw new Error('Forbidden quote');
        if (new Date(quote.expiresAt).getTime() < Date.now())
            throw new Error('Quote expired');
        const order = {
            uid,
            beneficiaryId,
            quoteId,
            amountGhs,
            amountUsd: quote.amountUsd,
            rate: quote.customerRate,
            spreadBps: quote.spreadBps,
            fees: quote.feeGhs,
            status: 'PENDING_PAYMENT',
            riskFlags: [],
            riskScore: 0,
            depositRef: null,
            settlement: null,
            payoutRef: null,
            timeline: { createdAt: (0, time_1.nowIso)(), updatedAt: (0, time_1.nowIso)(), fundsConfirmedAt: null, completedAt: null },
            dayKey: (0, time_1.dateKeyAccra)()
        };
        const ref = await firebase_1.db.collection('paymentOrders').add(order);
        return { id: ref.id, ...order };
    }
    async transition(orderId, next, metadata = {}) {
        const ref = firebase_1.db.collection('paymentOrders').doc(orderId);
        const snap = await ref.get();
        if (!snap.exists)
            throw new Error('Order not found');
        const curr = snap.data();
        const currentStatus = curr.status;
        if (!allowedTransitions[currentStatus]?.includes(next))
            throw new Error(`Invalid transition ${currentStatus} -> ${next}`);
        const patch = { status: next, 'timeline.updatedAt': (0, time_1.nowIso)(), ...metadata };
        if (next === 'FUNDS_CONFIRMED')
            patch['timeline.fundsConfirmedAt'] = (0, time_1.nowIso)();
        if (next === 'COMPLETED')
            patch['timeline.completedAt'] = (0, time_1.nowIso)();
        await ref.update(patch);
    }
}
exports.OrderService = OrderService;
const isTransitionAllowed = (from, to) => allowedTransitions[from].includes(to);
exports.isTransitionAllowed = isTransitionAllowed;
