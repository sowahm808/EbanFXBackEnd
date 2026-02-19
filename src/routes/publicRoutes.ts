import { Router } from 'express';

export const publicRoutes = Router();

publicRoutes.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'eban-fx-backend' });
});
