"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../models/schemas");
const kycService_1 = require("../services/kycService");
const quoteService_1 = require("../services/quoteService");
const limitService_1 = require("../services/limitService");
const orderService_1 = require("../services/orderService");
const auditService_1 = require("../services/auditService");
const kycService = new kycService_1.KycService();
const quoteService = new quoteService_1.QuoteService();
const orderService = new orderService_1.OrderService();
const audit = new auditService_1.AuditService();
const limits = new limitService_1.LimitService({ perTransactionMaxGhs: 50000, dailyMaxGhs: 100000, velocityCountLimit: 10 });
exports.userRoutes = (0, express_1.Router)();
exports.userRoutes.get('/me', async (req, res) => {
    const uid = req.user.uid;
    const doc = await firebase_1.db.collection('users').doc(uid).get();
    res.json(doc.data() || { uid, role: req.user?.role || 'user', kycStatus: 'none' });
});
exports.userRoutes.post('/kyc/submit', (0, validate_1.validateBody)(schemas_1.kycSubmitSchema), async (req, res) => {
    const data = await kycService.submit(req.user.uid, req.body);
    await audit.log(req.user.uid, 'KYC_SUBMITTED', 'kycSubmissions', data.id);
    res.status(201).json(data);
});
exports.userRoutes.get('/kyc/status', async (req, res) => {
    const user = await firebase_1.db.collection('users').doc(req.user.uid).get();
    res.json({ kycStatus: user.data()?.kycStatus || 'none' });
});
exports.userRoutes.post('/beneficiaries', (0, validate_1.validateBody)(schemas_1.beneficiarySchema), async (req, res) => {
    const payload = { uid: req.user.uid, ...req.body, createdAt: new Date().toISOString() };
    const ref = await firebase_1.db.collection('beneficiaries').add(payload);
    await audit.log(req.user.uid, 'BENEFICIARY_CREATED', 'beneficiaries', ref.id);
    res.status(201).json({ id: ref.id, ...payload });
});
exports.userRoutes.get('/beneficiaries', async (req, res) => {
    const snaps = await firebase_1.db.collection('beneficiaries').where('uid', '==', req.user.uid).get();
    res.json(snaps.docs.map((d) => ({ id: d.id, ...d.data() })));
});
exports.userRoutes.post('/quotes', (0, validate_1.validateBody)(schemas_1.quoteSchema), async (req, res) => {
    const quote = await quoteService.create(req.user.uid, req.body.amountGhs);
    await audit.log(req.user.uid, 'QUOTE_CREATED', 'quotes', quote.id);
    res.status(201).json(quote);
});
exports.userRoutes.post('/orders', (0, validate_1.validateBody)(schemas_1.orderCreateSchema), async (req, res) => {
    const uid = req.user.uid;
    const user = await firebase_1.db.collection('users').doc(uid).get();
    if (user.data()?.kycStatus !== 'approved')
        return res.status(403).json({ error: 'KYC approval required' });
    const limit = await limits.check(uid, req.body.amountGhs);
    if (!limit.ok)
        return res.status(400).json({ error: limit.reason });
    const order = await orderService.create(uid, req.body.beneficiaryId, req.body.quoteId, req.body.amountGhs);
    await audit.log(uid, 'ORDER_CREATED', 'paymentOrders', order.id);
    res.status(201).json(order);
});
exports.userRoutes.get('/orders', async (req, res) => {
    const snaps = await firebase_1.db.collection('paymentOrders').where('uid', '==', req.user.uid).get();
    res.json(snaps.docs.map((d) => ({ id: d.id, ...d.data() })));
});
exports.userRoutes.get('/orders/:id', async (req, res) => {
    const snap = await firebase_1.db.collection('paymentOrders').doc(req.params.id).get();
    if (!snap.exists || snap.data().uid !== req.user.uid)
        return res.status(404).json({ error: 'Not found' });
    res.json({ id: snap.id, ...snap.data() });
});
exports.userRoutes.post('/orders/:id/cancel', async (req, res) => {
    const snap = await firebase_1.db.collection('paymentOrders').doc(req.params.id).get();
    if (!snap.exists || snap.data().uid !== req.user.uid)
        return res.status(404).json({ error: 'Not found' });
    const status = snap.data().status;
    if (['PROCESSING', 'SENT', 'COMPLETED'].includes(status))
        return res.status(400).json({ error: 'Cannot cancel at this stage' });
    await firebase_1.db.collection('paymentOrders').doc(req.params.id).update({ status: 'CANCELED', 'timeline.updatedAt': new Date().toISOString() });
    await audit.log(req.user.uid, 'ORDER_CANCELED', 'paymentOrders', req.params.id);
    res.json({ ok: true });
});
