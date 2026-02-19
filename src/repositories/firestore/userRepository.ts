import { BaseRepository } from './baseRepository';
import { AppUser } from '../../models/types';

export class UserRepository extends BaseRepository {
  async getByUid(uid: string) {
    const snap = await this.collection('users').doc(uid).get();
    return snap.exists ? (snap.data() as AppUser) : null;
  }

  async upsert(user: Partial<AppUser> & { uid: string }) {
    await this.collection('users').doc(user.uid).set(user, { merge: true });
  }
}
