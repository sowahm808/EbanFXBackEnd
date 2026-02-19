export const logger = {
  info: (message: string, data: Record<string, unknown> = {}) => console.info(JSON.stringify({ level: 'INFO', message, ...data })),
  warn: (message: string, data: Record<string, unknown> = {}) => console.warn(JSON.stringify({ level: 'WARN', message, ...data })),
  error: (message: string, data: Record<string, unknown> = {}) => console.error(JSON.stringify({ level: 'ERROR', message, ...data }))
};
