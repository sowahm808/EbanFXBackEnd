"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
class LimitService {
    config;
    constructor(config) {
        this.config = config;
    }
    async check(uid, amountGhs) {
        if (amountGhs > this.config.perTransactionMaxGhs)
            return { ok: false, reason: 'per-transaction limit exceeded' };
        const dayKey = (0, time_1.dateKeyAccra)();
        const dayOrders = await firebase_1.db.collection('paymentOrders')
            .where('uid', '==', uid)
            .where('dayKey', '==', dayKey)
            .get();
        const dailyTotal = dayOrders.docs.reduce((sum, d) => sum + Number(d.data().amountGhs || 0), 0);
        if (dailyTotal + amountGhs > this.config.dailyMaxGhs)
            return { ok: false, reason: 'daily limit exceeded' };
        if (dayOrders.size >= this.config.velocityCountLimit)
            return { ok: false, reason: 'velocity check failed' };
        return { ok: true };
    }
}
exports.LimitService = LimitService;
