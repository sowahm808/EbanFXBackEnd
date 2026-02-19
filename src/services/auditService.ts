import { db } from '../config/firebase';
import { nowIso } from '../utils/time';

export class AuditService {
  async log(actorUid: string, action: string, entityType: string, entityId: string, metadata: Record<string, unknown> = {}) {
    await db.collection('auditLogs').add({ actorUid, action, entityType, entityId, metadata, createdAt: nowIso() });
  }
}
