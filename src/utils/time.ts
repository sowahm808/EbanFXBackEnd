export const nowIso = () => new Date().toISOString();
export const dateKeyAccra = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Accra' }).format(new Date());
