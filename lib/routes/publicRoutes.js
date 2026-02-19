"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRoutes = void 0;
const express_1 = require("express");
exports.publicRoutes = (0, express_1.Router)();
exports.publicRoutes.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'eban-fx-backend' });
});
