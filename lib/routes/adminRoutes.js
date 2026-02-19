"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const auditService_1 = require("../services/auditService");
const orderService_1 = require("../services/orderService");
const audit = new auditService_1.AuditService();
const orders = new orderService_1.OrderService();
exports.adminRoutes = (0, express_1.Router)();
exports.adminRoutes.get('/admin/kyc/pending', async (_req, res) => {
    const snaps = await firebase_1.db.collection('kycSubmissions').where('status', '==', 'pending').get();
    res.json(snaps.docs.map((d) => ({ id: d.id, ...d.data() })));
});
exports.adminRoutes.post('/admin/kyc/:id/approve', async (req, res) => {
    const subRef = firebase_1.db.collection('kycSubmissions').doc(req.params.id);
    const sub = await subRef.get();
    if (!sub.exists)
        return res.status(404).json({ error: 'Not found' });
    await subRef.update({ status: 'approved', reviewedAt: new Date().toISOString(), reviewerUid: req.user.uid });
    await firebase_1.db.collection('users').doc(sub.data().uid).set({ kycStatus: 'approved', updatedAt: new Date().toISOString() }, { merge: true });
    await audit.log(req.user.uid, 'KYC_APPROVED', 'kycSubmissions', req.params.id);
    res.json({ ok: true });
});
exports.adminRoutes.post('/admin/kyc/:id/reject', async (req, res) => {
    const subRef = firebase_1.db.collection('kycSubmissions').doc(req.params.id);
    const sub = await subRef.get();
    if (!sub.exists)
        return res.status(404).json({ error: 'Not found' });
    await subRef.update({ status: 'rejected', reviewedAt: new Date().toISOString(), reviewerUid: req.user.uid });
    await firebase_1.db.collection('users').doc(sub.data().uid).set({ kycStatus: 'rejected', updatedAt: new Date().toISOString() }, { merge: true });
    await audit.log(req.user.uid, 'KYC_REJECTED', 'kycSubmissions', req.params.id);
    res.json({ ok: true });
});
exports.adminRoutes.post('/admin/orders/:id/confirm-funds', async (req, res) => {
    await orders.transition(req.params.id, 'FUNDS_CONFIRMED');
    res.json({ ok: true });
});
exports.adminRoutes.post('/admin/orders/:id/mark-sent', async (req, res) => {
    await orders.transition(req.params.id, 'SENT');
    res.json({ ok: true });
});
exports.adminRoutes.post('/admin/orders/:id/mark-completed', async (req, res) => {
    await orders.transition(req.params.id, 'COMPLETED');
    res.json({ ok: true });
});
exports.adminRoutes.post('/admin/orders/:id/flag-suspicious', async (req, res) => {
    await firebase_1.db.collection('paymentOrders').doc(req.params.id).update({ riskFlags: ['SUSPICIOUS_MANUAL_REVIEW'], riskScore: 90, 'timeline.updatedAt': new Date().toISOString() });
    await audit.log(req.user.uid, 'ORDER_FLAGGED_SUSPICIOUS', 'paymentOrders', req.params.id);
    res.json({ ok: true });
});
