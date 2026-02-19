import { Router } from 'express';
import { db } from '../config/firebase';
import { AuditService } from '../services/auditService';
import { OrderService } from '../services/orderService';

const audit = new AuditService();
const orders = new OrderService();

export const adminRoutes = Router();

adminRoutes.get('/admin/kyc/pending', async (_req, res) => {
  const snaps = await db.collection('kycSubmissions').where('status', '==', 'pending').get();
  res.json(snaps.docs.map((d) => ({ id: d.id, ...d.data() })));
});

adminRoutes.post('/admin/kyc/:id/approve', async (req, res) => {
  const subRef = db.collection('kycSubmissions').doc(req.params.id);
  const sub = await subRef.get();
  if (!sub.exists) return res.status(404).json({ error: 'Not found' });
  await subRef.update({ status: 'approved', reviewedAt: new Date().toISOString(), reviewerUid: (req as any).user.uid });
  await db.collection('users').doc(sub.data()!.uid).set({ kycStatus: 'approved', updatedAt: new Date().toISOString() }, { merge: true });
  await audit.log((req as any).user.uid, 'KYC_APPROVED', 'kycSubmissions', req.params.id);
  res.json({ ok: true });
});

adminRoutes.post('/admin/kyc/:id/reject', async (req, res) => {
  const subRef = db.collection('kycSubmissions').doc(req.params.id);
  const sub = await subRef.get();
  if (!sub.exists) return res.status(404).json({ error: 'Not found' });
  await subRef.update({ status: 'rejected', reviewedAt: new Date().toISOString(), reviewerUid: (req as any).user.uid });
  await db.collection('users').doc(sub.data()!.uid).set({ kycStatus: 'rejected', updatedAt: new Date().toISOString() }, { merge: true });
  await audit.log((req as any).user.uid, 'KYC_REJECTED', 'kycSubmissions', req.params.id);
  res.json({ ok: true });
});

adminRoutes.post('/admin/orders/:id/confirm-funds', async (req, res) => {
  await orders.transition(req.params.id, 'FUNDS_CONFIRMED');
  res.json({ ok: true });
});
adminRoutes.post('/admin/orders/:id/mark-sent', async (req, res) => {
  await orders.transition(req.params.id, 'SENT');
  res.json({ ok: true });
});
adminRoutes.post('/admin/orders/:id/mark-completed', async (req, res) => {
  await orders.transition(req.params.id, 'COMPLETED');
  res.json({ ok: true });
});
adminRoutes.post('/admin/orders/:id/flag-suspicious', async (req, res) => {
  await db.collection('paymentOrders').doc(req.params.id).update({ riskFlags: ['SUSPICIOUS_MANUAL_REVIEW'], riskScore: 90, 'timeline.updatedAt': new Date().toISOString() });
  await audit.log((req as any).user.uid, 'ORDER_FLAGGED_SUSPICIOUS', 'paymentOrders', req.params.id);
  res.json({ ok: true });
});
