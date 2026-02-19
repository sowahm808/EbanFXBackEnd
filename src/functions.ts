import { onRequest } from 'firebase-functions/v2/https';
import app from './index';
import { region, webhookSecret } from './config/env';

export const api = onRequest({ region: region.value(), secrets: [webhookSecret], invoker: 'public' }, app);

const isFirebaseManagedRuntime = Boolean(process.env.FUNCTION_TARGET ?? process.env.K_SERVICE);

if (!isFirebaseManagedRuntime) {
  const port = Number(process.env.PORT ?? 3000);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Eban FX backend listening on port ${port}`);
  });
}
