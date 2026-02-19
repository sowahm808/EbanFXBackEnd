"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settlementWebhookSchema = exports.depositWebhookSchema = exports.orderCreateSchema = exports.quoteSchema = exports.beneficiarySchema = exports.kycSubmitSchema = void 0;
const zod_1 = require("zod");
exports.kycSubmitSchema = zod_1.z.object({
    idType: zod_1.z.string().min(2),
    idNumber: zod_1.z.string().min(4),
    country: zod_1.z.string().min(2),
    documentUrls: zod_1.z.array(zod_1.z.string().url()).max(5),
    selfieUrl: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().max(500).optional()
});
exports.beneficiarySchema = zod_1.z.object({
    type: zod_1.z.enum(['wallet', 'bank']),
    name: zod_1.z.string().min(2),
    country: zod_1.z.string().min(2),
    network: zod_1.z.string().optional(),
    walletAddress: zod_1.z.string().optional(),
    bankDetails: zod_1.z.record(zod_1.z.any()).optional()
}).superRefine((v, ctx) => {
    if (v.type === 'wallet' && !v.walletAddress)
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'walletAddress required for wallet type' });
    if (v.type === 'bank' && !v.bankDetails)
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'bankDetails required for bank type' });
});
exports.quoteSchema = zod_1.z.object({ amountGhs: zod_1.z.number().positive() });
exports.orderCreateSchema = zod_1.z.object({
    beneficiaryId: zod_1.z.string().min(4),
    quoteId: zod_1.z.string().min(4),
    amountGhs: zod_1.z.number().positive()
});
exports.depositWebhookSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
    depositRef: zod_1.z.string(),
    amountGhs: zod_1.z.number().positive(),
    idempotencyKey: zod_1.z.string().min(8)
});
exports.settlementWebhookSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
    txHash: zod_1.z.string().optional(),
    payoutRef: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().min(8)
}).superRefine((v, ctx) => {
    if (!v.txHash && !v.payoutRef)
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'txHash or payoutRef required' });
});
