"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const fx_1 = require("../utils/fx");
class QuoteService {
    async create(uid, amountGhs) {
        const cfgSnap = await firebase_1.db.collection('config').doc('pricing').get();
        const cfg = cfgSnap.exists ? cfgSnap.data() : { flatFeeGhs: 0, percentFeeBps: 0 };
        const rates = await firebase_1.db.collection('fxRates').orderBy('effectiveFrom', 'desc').limit(1).get();
        if (rates.empty)
            throw new Error('No FX rate configured');
        const rate = rates.docs[0].data();
        const { customerRate, feeGhs, amountUsd } = (0, fx_1.calculateQuote)({
            amountGhs,
            midRate: rate.midRate,
            spreadBps: rate.spreadBps,
            flatFeeGhs: cfg.flatFeeGhs || 0,
            percentFeeBps: cfg.percentFeeBps || 0
        });
        const quote = {
            uid,
            amountGhs,
            midRate: rate.midRate,
            spreadBps: rate.spreadBps,
            customerRate,
            amountUsd,
            feeGhs,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            createdAt: (0, time_1.nowIso)()
        };
        const ref = await firebase_1.db.collection('quotes').add(quote);
        return { id: ref.id, ...quote };
    }
}
exports.QuoteService = QuoteService;
