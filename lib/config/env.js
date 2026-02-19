"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectTimeZone = exports.region = exports.webhookSecret = void 0;
const params_1 = require("firebase-functions/params");
exports.webhookSecret = (0, params_1.defineSecret)('WEBHOOK_SECRET');
exports.region = (0, params_1.defineString)('FUNCTION_REGION', { default: 'us-central1' });
exports.projectTimeZone = (0, params_1.defineString)('PROJECT_TIMEZONE', { default: 'Africa/Accra' });
