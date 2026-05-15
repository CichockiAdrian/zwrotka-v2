// src/utils/voucher.ts
import type { Voucher, VoucherStats } from '@/types/voucher';
import { addDays, isPast, parseISO, startOfMonth } from 'date-fns';

export function formatValue(grosze: number): string {
  return (grosze / 100).toFixed(2).replace('.', ',') + ' zł';
}

export function formatValueShort(grosze: number): string {
  return (grosze / 100).toFixed(2).replace('.', ',');
}

export function parsePLNToGrosze(input: string): number | null {
  const n = parseFloat(input.trim().replace(',', '.').replace(/[^\d.]/g, ''));
  if (isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function computeStats(vouchers: Voucher[]): VoucherStats {
  const active = vouchers.filter(v => v.status === 'active');
  const used = vouchers.filter(v => v.status === 'used');
  const expired = vouchers.filter(v => v.status === 'expired');

  const monthStart = startOfMonth(new Date()).toISOString();
  const thisMonthVouchers = vouchers.filter(v => v.createdAt >= monthStart);

  const oneWeek = addDays(new Date(), 7);
  const expiringThisWeekCount = active.filter(
    v => v.expiresAt && !isPast(parseISO(v.expiresAt)) && parseISO(v.expiresAt) < oneWeek
  ).length;

  return {
    totalActiveGrosze: active.reduce((s, v) => s + v.valueGrosze, 0),
    thisMonthGrosze: thisMonthVouchers.reduce((s, v) => s + v.valueGrosze, 0),
    usedGrosze: used.reduce((s, v) => s + v.valueGrosze, 0),
    activeCount: active.length,
    usedCount: used.length,
    expiredCount: expired.length,
    totalCount: vouchers.length,
    expiringThisWeekCount,
  };
}

export function getStoreInitial(storeName: string): string {
  return (storeName || 'V').charAt(0).toUpperCase();
}

export function generateDefaultLabel(storeName: string): string {
  const d = new Date();
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${storeName || 'Voucher'} ${dd}.${mm}`;
}

export function truncateCode(code: string, max = 22): string {
  if (code.length <= max) return code;
  return code.slice(0, 10) + '…' + code.slice(-8);
}
