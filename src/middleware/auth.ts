import { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; role?: string; email?: string };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
    const token = auth.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = { uid: decoded.uid, role: (decoded.role as string | undefined) || 'user', email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
