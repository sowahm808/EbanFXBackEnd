"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
class LedgerService {
    async add(uid, orderId, type, currency, amount, narrative) {
        await firebase_1.db.collection('ledgerEntries').add({ uid, orderId, type, currency, amount, narrative, createdAt: (0, time_1.nowIso)() });
    }
}
exports.LedgerService = LedgerService;
