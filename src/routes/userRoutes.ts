import { Router } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { beneficiarySchema, kycSubmitSchema, orderCreateSchema, quoteSchema } from '../models/schemas';
import { KycService } from '../services/kycService';
import { QuoteService } from '../services/quoteService';
import { LimitService } from '../services/limitService';
import { OrderService } from '../services/orderService';
import { AuditService } from '../services/auditService';

const kycService = new KycService();
const quoteService = new QuoteService();
const orderService = new OrderService();
const audit = new AuditService();
const limits = new LimitService({ perTransactionMaxGhs: 50000, dailyMaxGhs: 100000, velocityCountLimit: 10 });

export const userRoutes = Router();

userRoutes.get('/me', async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const doc = await db.collection('users').doc(uid).get();
  res.json(doc.data() || { uid, role: req.user?.role || 'user', kycStatus: 'none' });
});

userRoutes.post('/kyc/submit', validateBody(kycSubmitSchema), async (req: AuthenticatedRequest, res) => {
  const data = await kycService.submit(req.user!.uid, req.body);
  await audit.log(req.user!.uid, 'KYC_SUBMITTED', 'kycSubmissions', data.id);
  res.status(201).json(data);
});

userRoutes.get('/kyc/status', async (req: AuthenticatedRequest, res) => {
  const user = await db.collection('users').doc(req.user!.uid).get();
  res.json({ kycStatus: user.data()?.kycStatus || 'none' });
});

userRoutes.post('/beneficiaries', validateBody(beneficiarySchema), async (req: AuthenticatedRequest, res) => {
  const payload = { uid: req.user!.uid, ...req.body, createdAt: new Date().toISOString() };
  const ref = await db.collection('beneficiaries').add(payload);
  await audit.log(req.user!.uid, 'BENEFICIARY_CREATED', 'beneficiaries', ref.id);
  res.status(201).json({ id: ref.id, ...payload });
});

userRoutes.get('/beneficiaries', async (req: AuthenticatedRequest, res) => {
  const snaps = await db.collection('beneficiaries').where('uid', '==', req.user!.uid).get();
  res.json(snaps.docs.map((d) => ({ id: d.id, ...d.data() })));
});

userRoutes.post('/quotes', validateBody(quoteSchema), async (req: AuthenticatedRequest, res) => {
  const quote = await quoteService.create(req.user!.uid, req.body.amountGhs);
  await audit.log(req.user!.uid, 'QUOTE_CREATED', 'quotes', quote.id);
  res.status(201).json(quote);
});

userRoutes.post('/orders', validateBody(orderCreateSchema), async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const user = await db.collection('users').doc(uid).get();
  if (user.data()?.kycStatus !== 'approved') return res.status(403).json({ error: 'KYC approval required' });
  const limit = await limits.check(uid, req.body.amountGhs);
  if (!limit.ok) return res.status(400).json({ error: limit.reason });
  const order = await orderService.create(uid, req.body.beneficiaryId, req.body.quoteId, req.body.amountGhs);
  await audit.log(uid, 'ORDER_CREATED', 'paymentOrders', order.id);
  res.status(201).json(order);
});

userRoutes.get('/orders', async (req: AuthenticatedRequest, res) => {
  const snaps = await db.collection('paymentOrders').where('uid', '==', req.user!.uid).get();
  res.json(snaps.docs.map((d) => ({ id: d.id, ...d.data() })));
});

userRoutes.get('/orders/:id', async (req: AuthenticatedRequest, res) => {
  const snap = await db.collection('paymentOrders').doc(req.params.id).get();
  if (!snap.exists || snap.data()!.uid !== req.user!.uid) return res.status(404).json({ error: 'Not found' });
  res.json({ id: snap.id, ...snap.data() });
});

userRoutes.post('/orders/:id/cancel', async (req: AuthenticatedRequest, res) => {
  const snap = await db.collection('paymentOrders').doc(req.params.id).get();
  if (!snap.exists || snap.data()!.uid !== req.user!.uid) return res.status(404).json({ error: 'Not found' });
  const status = snap.data()!.status;
  if (['PROCESSING', 'SENT', 'COMPLETED'].includes(status)) return res.status(400).json({ error: 'Cannot cancel at this stage' });
  await db.collection('paymentOrders').doc(req.params.id).update({ status: 'CANCELED', 'timeline.updatedAt': new Date().toISOString() });
  await audit.log(req.user!.uid, 'ORDER_CANCELED', 'paymentOrders', req.params.id);
  res.json({ ok: true });
});
