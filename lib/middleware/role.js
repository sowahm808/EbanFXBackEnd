"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (...roles) => (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role))
        return res.status(403).json({ error: 'Forbidden' });
    next();
};
exports.requireRole = requireRole;
