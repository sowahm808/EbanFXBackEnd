"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.adminAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const parseServiceAccountFromEnv = () => {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!rawServiceAccount)
        return undefined;
    const parsedServiceAccount = JSON.parse(rawServiceAccount);
    const projectId = parsedServiceAccount.project_id;
    const clientEmail = parsedServiceAccount.client_email;
    const privateKey = parsedServiceAccount.private_key?.replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is set but missing one of: project_id, client_email, private_key.');
    }
    return (0, app_1.cert)({
        projectId,
        clientEmail,
        privateKey
    });
};
const app = (0, app_1.getApps)().length > 0
    ? (0, app_1.getApps)()[0]
    : (() => {
        const credential = parseServiceAccountFromEnv();
        if (credential) {
            return (0, app_1.initializeApp)({ credential });
        }
        return (0, app_1.initializeApp)();
    })();
exports.adminAuth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
