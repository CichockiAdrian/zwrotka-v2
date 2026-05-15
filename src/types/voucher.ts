// src/types/voucher.ts

export type VoucherStatus = 'active' | 'used' | 'expired';
export type VoucherSource = 'scan' | 'manual' | 'seed';
export type CodeFormat = 'qr' | 'ean13' | 'ean8' | 'code128' | 'code39' | 'unknown';

export interface Voucher {
  id: string;
  code: string;
  codeFormat: CodeFormat;
  valueGrosze: number;      // 100 = 1.00 zł
  label: string;
  storeName: string;
  status: VoucherStatus;
  source: VoucherSource;
  issuedAt: string;
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface CreateVoucherInput {
  code: string;
  codeFormat?: CodeFormat;
  valueGrosze: number;
  label?: string;
  storeName?: string;
  issuedAt?: string;
  expiresAt?: string | null;
  notes?: string;
  source?: VoucherSource;
}

export type UpdateVoucherInput = Partial<
  Pick<Voucher, 'label' | 'storeName' | 'notes' | 'expiresAt' | 'valueGrosze' | 'status'>
>;

export type VoucherSortKey = 'createdAt' | 'valueGrosze' | 'expiresAt' | 'storeName';

export interface VoucherSort {
  key: VoucherSortKey;
  direction: 'asc' | 'desc';
}

export interface VoucherFilters {
  status: VoucherStatus | 'all';
  search: string;
}

export interface VoucherStats {
  totalActiveGrosze: number;
  thisMonthGrosze: number;
  usedGrosze: number;
  activeCount: number;
  usedCount: number;
  expiredCount: number;
  totalCount: number;
  expiringThisWeekCount: number;
}
