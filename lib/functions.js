"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const index_1 = __importDefault(require("./index"));
const env_1 = require("./config/env");
exports.api = (0, https_1.onRequest)({ region: env_1.region.value(), secrets: [env_1.webhookSecret], invoker: 'public' }, index_1.default);
