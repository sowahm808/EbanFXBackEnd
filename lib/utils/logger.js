"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, data = {}) => console.info(JSON.stringify({ level: 'INFO', message, ...data })),
    warn: (message, data = {}) => console.warn(JSON.stringify({ level: 'WARN', message, ...data })),
    error: (message, data = {}) => console.error(JSON.stringify({ level: 'ERROR', message, ...data }))
};
