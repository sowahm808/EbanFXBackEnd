import { Router } from 'express';
import { webhookSecret } from '../config/env';
import { validateBody } from '../middleware/validate';
import { depositWebhookSchema, settlementWebhookSchema } from '../models/schemas';
import { db } from '../config/firebase';
import { OrderService } from '../services/orderService';
import { LedgerService } from '../services/ledgerService';

const orderService = new OrderService();
const ledger = new LedgerService();

const verifySecret = (header?: string) => header && header === webhookSecret.value();

export const webhookRoutes = Router();

webhookRoutes.post('/webhooks/deposit', validateBody(depositWebhookSchema), async (req, res) => {
  if (!verifySecret(req.headers['x-webhook-secret'] as string | undefined)) return res.status(401).json({ error: 'Unauthorized webhook' });
  const existing = await db.collection('webhookEvents').doc(req.body.idempotencyKey).get();
  if (existing.exists) return res.json({ ok: true, idempotent: true });

  const snap = await db.collection('paymentOrders').doc(req.body.orderId).get();
  if (!snap.exists) return res.status(404).json({ error: 'Order not found' });

  await db.collection('paymentOrders').doc(req.body.orderId).update({ depositRef: req.body.depositRef });
  await orderService.transition(req.body.orderId, 'FUNDS_CONFIRMED');
  const data = snap.data()!;
  await ledger.add(data.uid, req.body.orderId, 'CREDIT', 'GHS', req.body.amountGhs, 'Deposit confirmed');
  await db.collection('webhookEvents').doc(req.body.idempotencyKey).set({ type: 'deposit', createdAt: new Date().toISOString() });

  res.json({ ok: true });
});

webhookRoutes.post('/webhooks/settlement', validateBody(settlementWebhookSchema), async (req, res) => {
  if (!verifySecret(req.headers['x-webhook-secret'] as string | undefined)) return res.status(401).json({ error: 'Unauthorized webhook' });
  const existing = await db.collection('webhookEvents').doc(req.body.idempotencyKey).get();
  if (existing.exists) return res.json({ ok: true, idempotent: true });

  const orderRef = db.collection('paymentOrders').doc(req.body.orderId);
  await orderService.transition(req.body.orderId, 'SENT');
  await orderRef.update({ settlement: { network: 'TRON', txHash: req.body.txHash || null, sentAt: new Date().toISOString() }, payoutRef: req.body.payoutRef || null });
  await orderService.transition(req.body.orderId, 'COMPLETED');
  await db.collection('webhookEvents').doc(req.body.idempotencyKey).set({ type: 'settlement', createdAt: new Date().toISOString() });

  res.json({ ok: true });
});
