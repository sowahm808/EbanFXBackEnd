import { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; role?: string; email?: string };
}

const looksLikeJwt = (value: string): boolean => value.split('.').length === 3;

const getTokenFromAuthorizationHeader = (authorization?: string): string | undefined => {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.trim().split(/\s+/, 2);
  if (!scheme || !token) return undefined;

  const normalizedScheme = scheme.toLowerCase();
  if (normalizedScheme === 'bearer' || normalizedScheme === 'firebase') {
    if (token === 'undefined' || token === 'null') return undefined;
    return token;
  }

  return looksLikeJwt(token) ? token : undefined;
};

const normalizeToken = (rawToken?: string): string | undefined => {
  if (!rawToken) return undefined;

  const cleanedToken = rawToken.trim().replace(/^['"]|['"]$/g, '');
  if (!cleanedToken || cleanedToken === 'undefined' || cleanedToken === 'null') return undefined;

  try {
    const maybeEncoded = cleanedToken.includes('%') ? decodeURIComponent(cleanedToken) : cleanedToken;
    const parsedAuthorizationToken = getTokenFromAuthorizationHeader(maybeEncoded);
    if (parsedAuthorizationToken) return parsedAuthorizationToken;
    if (maybeEncoded.includes(' ')) return undefined;
    return maybeEncoded;
  } catch {
    const parsedAuthorizationToken = getTokenFromAuthorizationHeader(cleanedToken);
    if (parsedAuthorizationToken) return parsedAuthorizationToken;
    if (cleanedToken.includes(' ')) return undefined;
    return cleanedToken;
  }
};

const getTokenFromHeaderValue = (value?: string | string[]): string | undefined => {
  const headerValue = Array.isArray(value) ? value[0] : value;
  return normalizeToken(headerValue);
};

const getTokenFromQueryValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return normalizeToken(value);
  if (Array.isArray(value)) return getTokenFromQueryValue(value[0]);
  return undefined;
};

const getTokenFromCookieHeader = (cookieHeader?: string): string | undefined => {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split('=');
    if (!rawName || rawValueParts.length === 0) continue;
    if (!['__session', 'idToken', 'token', 'accessToken', 'authToken'].includes(rawName)) continue;

    const value = rawValueParts.join('=').trim();
    if (!value) continue;

    try {
      return normalizeToken(decodeURIComponent(value));
    } catch {
      return normalizeToken(value);
    }
  }

  return undefined;
};

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      getTokenFromAuthorizationHeader(req.headers.authorization) ||
      getTokenFromHeaderValue(req.headers.authorization) ||
      getTokenFromHeaderValue(req.headers['x-firebase-auth']) ||
      getTokenFromHeaderValue(req.headers['x-access-token']) ||
      getTokenFromHeaderValue(req.headers['x-auth-token']) ||
      getTokenFromHeaderValue(req.headers['x-id-token']) ||
      getTokenFromHeaderValue(req.headers['id-token']) ||
      getTokenFromCookieHeader(req.headers.cookie) ||
      getTokenFromQueryValue(req.query.token) ||
      getTokenFromQueryValue(req.query.idToken);

    if (!token) return res.status(401).json({ error: 'Missing token' });

    const decoded = await adminAuth.verifyIdToken(token);
    req.user = { uid: decoded.uid, role: (decoded.role as string | undefined) || 'user', email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
