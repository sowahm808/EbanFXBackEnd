import { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; role?: string; email?: string };
}

const getTokenFromAuthorizationHeader = (authorization?: string): string | undefined => {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.trim().split(/\s+/, 2);
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') return undefined;
  return token;
};

const getTokenFromCookieHeader = (cookieHeader?: string): string | undefined => {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split('=');
    if (!rawName || rawValueParts.length === 0) continue;
    if (!['__session', 'idToken', 'token'].includes(rawName)) continue;

    const value = rawValueParts.join('=').trim();
    if (!value) continue;

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return undefined;
};

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      getTokenFromAuthorizationHeader(req.headers.authorization) || getTokenFromCookieHeader(req.headers.cookie);

    if (!token) return res.status(401).json({ error: 'Missing token' });

    const decoded = await adminAuth.verifyIdToken(token);
    req.user = { uid: decoded.uid, role: (decoded.role as string | undefined) || 'user', email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
