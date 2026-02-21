"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const firebase_1 = require("../config/firebase");
const getTokenFromAuthorizationHeader = (authorization) => {
    if (!authorization)
        return undefined;
    const [scheme, token] = authorization.trim().split(/\s+/, 2);
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer')
        return undefined;
    return token;
};
const normalizeToken = (rawToken) => {
    if (!rawToken)
        return undefined;
    const cleanedToken = rawToken.trim().replace(/^['"]|['"]$/g, '');
    if (!cleanedToken)
        return undefined;
    return getTokenFromAuthorizationHeader(cleanedToken) || cleanedToken;
};
const getTokenFromHeaderValue = (value) => {
    const headerValue = Array.isArray(value) ? value[0] : value;
    return normalizeToken(headerValue);
};
const getTokenFromQueryValue = (value) => {
    if (typeof value === 'string')
        return normalizeToken(value);
    if (Array.isArray(value))
        return getTokenFromQueryValue(value[0]);
    return undefined;
};
const getTokenFromCookieHeader = (cookieHeader) => {
    if (!cookieHeader)
        return undefined;
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
        const [rawName, ...rawValueParts] = cookie.trim().split('=');
        if (!rawName || rawValueParts.length === 0)
            continue;
        if (!['__session', 'idToken', 'token', 'accessToken', 'authToken'].includes(rawName))
            continue;
        const value = rawValueParts.join('=').trim();
        if (!value)
            continue;
        try {
            return normalizeToken(decodeURIComponent(value));
        }
        catch {
            return normalizeToken(value);
        }
    }
    return undefined;
};
const requireAuth = async (req, res, next) => {
    try {
        const token = getTokenFromAuthorizationHeader(req.headers.authorization) ||
            getTokenFromHeaderValue(req.headers.authorization) ||
            getTokenFromHeaderValue(req.headers['x-firebase-auth']) ||
            getTokenFromHeaderValue(req.headers['x-access-token']) ||
            getTokenFromHeaderValue(req.headers['x-auth-token']) ||
            getTokenFromHeaderValue(req.headers['x-id-token']) ||
            getTokenFromHeaderValue(req.headers['id-token']) ||
            getTokenFromCookieHeader(req.headers.cookie) ||
            getTokenFromQueryValue(req.query.token) ||
            getTokenFromQueryValue(req.query.idToken);
        if (!token)
            return res.status(401).json({ error: 'Missing token' });
        const decoded = await firebase_1.adminAuth.verifyIdToken(token);
        req.user = { uid: decoded.uid, role: decoded.role || 'user', email: decoded.email };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
