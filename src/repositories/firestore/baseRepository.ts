import { db } from '../../config/firebase';

export class BaseRepository {
  protected collection(name: string) {
    return db.collection(name);
  }
}
