import { defineSecret, defineString } from 'firebase-functions/params';

export const webhookSecret = defineSecret('WEBHOOK_SECRET');
export const region = defineString('FUNCTION_REGION', { default: 'us-central1' });
export const projectTimeZone = defineString('PROJECT_TIMEZONE', { default: 'Africa/Accra' });
