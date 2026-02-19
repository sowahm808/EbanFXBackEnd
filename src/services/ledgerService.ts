import { db } from '../config/firebase';
import { nowIso } from '../utils/time';

export class LedgerService {
  async add(uid: string, orderId: string, type: 'DEBIT' | 'CREDIT', currency: 'GHS' | 'USD', amount: number, narrative: string) {
    await db.collection('ledgerEntries').add({ uid, orderId, type, currency, amount, narrative, createdAt: nowIso() });
  }
}
