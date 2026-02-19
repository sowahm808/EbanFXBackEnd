"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const baseRepository_1 = require("./baseRepository");
class UserRepository extends baseRepository_1.BaseRepository {
    async getByUid(uid) {
        const snap = await this.collection('users').doc(uid).get();
        return snap.exists ? snap.data() : null;
    }
    async upsert(user) {
        await this.collection('users').doc(user.uid).set(user, { merge: true });
    }
}
exports.UserRepository = UserRepository;
