"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = void 0;
const express_1 = require("express");
const env_1 = require("../config/env");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../models/schemas");
const firebase_1 = require("../config/firebase");
const orderService_1 = require("../services/orderService");
const ledgerService_1 = require("../services/ledgerService");
const orderService = new orderService_1.OrderService();
const ledger = new ledgerService_1.LedgerService();
const verifySecret = (header) => header && header === env_1.webhookSecret.value();
exports.webhookRoutes = (0, express_1.Router)();
exports.webhookRoutes.post('/webhooks/deposit', (0, validate_1.validateBody)(schemas_1.depositWebhookSchema), async (req, res) => {
    if (!verifySecret(req.headers['x-webhook-secret']))
        return res.status(401).json({ error: 'Unauthorized webhook' });
    const existing = await firebase_1.db.collection('webhookEvents').doc(req.body.idempotencyKey).get();
    if (existing.exists)
        return res.json({ ok: true, idempotent: true });
    const snap = await firebase_1.db.collection('paymentOrders').doc(req.body.orderId).get();
    if (!snap.exists)
        return res.status(404).json({ error: 'Order not found' });
    await firebase_1.db.collection('paymentOrders').doc(req.body.orderId).update({ depositRef: req.body.depositRef });
    await orderService.transition(req.body.orderId, 'FUNDS_CONFIRMED');
    const data = snap.data();
    await ledger.add(data.uid, req.body.orderId, 'CREDIT', 'GHS', req.body.amountGhs, 'Deposit confirmed');
    await firebase_1.db.collection('webhookEvents').doc(req.body.idempotencyKey).set({ type: 'deposit', createdAt: new Date().toISOString() });
    res.json({ ok: true });
});
exports.webhookRoutes.post('/webhooks/settlement', (0, validate_1.validateBody)(schemas_1.settlementWebhookSchema), async (req, res) => {
    if (!verifySecret(req.headers['x-webhook-secret']))
        return res.status(401).json({ error: 'Unauthorized webhook' });
    const existing = await firebase_1.db.collection('webhookEvents').doc(req.body.idempotencyKey).get();
    if (existing.exists)
        return res.json({ ok: true, idempotent: true });
    const orderRef = firebase_1.db.collection('paymentOrders').doc(req.body.orderId);
    await orderService.transition(req.body.orderId, 'SENT');
    await orderRef.update({ settlement: { network: 'TRON', txHash: req.body.txHash || null, sentAt: new Date().toISOString() }, payoutRef: req.body.payoutRef || null });
    await orderService.transition(req.body.orderId, 'COMPLETED');
    await firebase_1.db.collection('webhookEvents').doc(req.body.idempotencyKey).set({ type: 'settlement', createdAt: new Date().toISOString() });
    res.json({ ok: true });
});
