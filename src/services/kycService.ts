import { db } from '../config/firebase';
import { nowIso } from '../utils/time';

const maskId = (id: string) => `${'*'.repeat(Math.max(0, id.length - 4))}${id.slice(-4)}`;

export class KycService {
  async submit(uid: string, payload: { idType: string; idNumber: string; country: string; documentUrls: string[]; selfieUrl?: string; notes?: string }) {
    const submission = {
      uid,
      status: 'pending',
      submittedAt: nowIso(),
      reviewedAt: null,
      reviewerUid: null,
      idType: payload.idType,
      idNumberMasked: maskId(payload.idNumber),
      country: payload.country,
      documentUrls: payload.documentUrls,
      selfieUrl: payload.selfieUrl || null,
      notes: payload.notes || null
    };
    const ref = await db.collection('kycSubmissions').add(submission);
    await db.collection('users').doc(uid).set({ kycStatus: 'pending', updatedAt: nowIso() }, { merge: true });
    return { id: ref.id, ...submission };
  }
}
