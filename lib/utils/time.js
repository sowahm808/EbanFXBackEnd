"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateKeyAccra = exports.nowIso = void 0;
const nowIso = () => new Date().toISOString();
exports.nowIso = nowIso;
const dateKeyAccra = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Accra' }).format(new Date());
exports.dateKeyAccra = dateKeyAccra;
