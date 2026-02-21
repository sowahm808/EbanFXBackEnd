import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

type ServiceAccountInput = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

const parseServiceAccountFromEnv = (): ReturnType<typeof cert> | undefined => {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!rawServiceAccount) return undefined;

  const parsedServiceAccount = JSON.parse(rawServiceAccount) as ServiceAccountInput;
  const projectId = parsedServiceAccount.project_id;
  const clientEmail = parsedServiceAccount.client_email;
  const privateKey = parsedServiceAccount.private_key?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON is set but missing one of: project_id, client_email, private_key.'
    );
  }

  return cert({
    projectId,
    clientEmail,
    privateKey
  });
};

const app =
  getApps().length > 0
    ? getApps()[0]
    : (() => {
        const credential = parseServiceAccountFromEnv();

        if (credential) {
          return initializeApp({ credential });
        }

        return initializeApp();
      })();

export const adminAuth = getAuth(app);
export const db = getFirestore(app);
