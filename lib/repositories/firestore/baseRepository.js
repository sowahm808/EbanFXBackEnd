"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const firebase_1 = require("../../config/firebase");
class BaseRepository {
    collection(name) {
        return firebase_1.db.collection(name);
    }
}
exports.BaseRepository = BaseRepository;
