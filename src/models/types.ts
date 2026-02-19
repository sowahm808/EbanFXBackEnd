export type UserRole = 'user' | 'admin' | 'compliance';
export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type BeneficiaryType = 'wallet' | 'bank';

export type OrderStatus =
  | 'DRAFT'
  | 'QUOTED'
  | 'PENDING_PAYMENT'
  | 'FUNDS_CONFIRMED'
  | 'PROCESSING'
  | 'SENT'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED';

export interface AppUser {
  uid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  role: UserRole;
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  uid: string;
  amountGhs: number;
  midRate: number;
  spreadBps: number;
  customerRate: number;
  amountUsd: number;
  feeGhs: number;
  expiresAt: string;
  createdAt: string;
}
