import { z } from 'zod';

export const kycSubmitSchema = z.object({
  idType: z.string().min(2),
  idNumber: z.string().min(4),
  country: z.string().min(2),
  documentUrls: z.array(z.string().url()).max(5),
  selfieUrl: z.string().url().optional(),
  notes: z.string().max(500).optional()
});

export const beneficiarySchema = z.object({
  type: z.enum(['wallet', 'bank']),
  name: z.string().min(2),
  country: z.string().min(2),
  network: z.string().optional(),
  walletAddress: z.string().optional(),
  bankDetails: z.record(z.any()).optional()
}).superRefine((v, ctx) => {
  if (v.type === 'wallet' && !v.walletAddress) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'walletAddress required for wallet type' });
  if (v.type === 'bank' && !v.bankDetails) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'bankDetails required for bank type' });
});

export const quoteSchema = z.object({ amountGhs: z.number().positive() });
export const orderCreateSchema = z.object({
  beneficiaryId: z.string().min(4),
  quoteId: z.string().min(4),
  amountGhs: z.number().positive()
});

export const depositWebhookSchema = z.object({
  orderId: z.string(),
  depositRef: z.string(),
  amountGhs: z.number().positive(),
  idempotencyKey: z.string().min(8)
});

export const settlementWebhookSchema = z.object({
  orderId: z.string(),
  txHash: z.string().optional(),
  payoutRef: z.string().optional(),
  idempotencyKey: z.string().min(8)
}).superRefine((v, ctx) => {
  if (!v.txHash && !v.payoutRef) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'txHash or payoutRef required' });
});
