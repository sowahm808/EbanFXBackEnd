"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.adminAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const app = (0, app_1.getApps)().length ? (0, app_1.getApps)()[0] : (0, app_1.initializeApp)();
exports.adminAuth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
