"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const maskId = (id) => `${'*'.repeat(Math.max(0, id.length - 4))}${id.slice(-4)}`;
class KycService {
    async submit(uid, payload) {
        const submission = {
            uid,
            status: 'pending',
            submittedAt: (0, time_1.nowIso)(),
            reviewedAt: null,
            reviewerUid: null,
            idType: payload.idType,
            idNumberMasked: maskId(payload.idNumber),
            country: payload.country,
            documentUrls: payload.documentUrls,
            selfieUrl: payload.selfieUrl || null,
            notes: payload.notes || null
        };
        const ref = await firebase_1.db.collection('kycSubmissions').add(submission);
        await firebase_1.db.collection('users').doc(uid).set({ kycStatus: 'pending', updatedAt: (0, time_1.nowIso)() }, { merge: true });
        return { id: ref.id, ...submission };
    }
}
exports.KycService = KycService;
