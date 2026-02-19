import { onRequest } from 'firebase-functions/v2/https';
import app from './index';
import { region, webhookSecret } from './config/env';

export const api = onRequest({ region: region.value(), secrets: [webhookSecret], invoker: 'public' }, app);
