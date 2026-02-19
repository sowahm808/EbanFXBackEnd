"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
class AuditService {
    async log(actorUid, action, entityType, entityId, metadata = {}) {
        await firebase_1.db.collection('auditLogs').add({ actorUid, action, entityType, entityId, metadata, createdAt: (0, time_1.nowIso)() });
    }
}
exports.AuditService = AuditService;
