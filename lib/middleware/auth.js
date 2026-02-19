"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const firebase_1 = require("../config/firebase");
const requireAuth = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer '))
            return res.status(401).json({ error: 'Missing token' });
        const token = auth.slice(7);
        const decoded = await firebase_1.adminAuth.verifyIdToken(token);
        req.user = { uid: decoded.uid, role: decoded.role || 'user', email: decoded.email };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
