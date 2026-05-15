// src/utils/date.ts
import { format, formatDistanceToNow, isPast, parseISO, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';

export function nowISO(): string { return new Date().toISOString(); }

export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd.MM.yyyy', { locale: pl });
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), 'd MMM', { locale: pl });
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: pl });
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return isPast(parseISO(expiresAt));
}

export function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = parseISO(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isoFromDaysAgo(n: number): string {
  return addDays(new Date(), -n).toISOString();
}

export function isoFromDaysFromNow(n: number): string {
  return addDays(new Date(), n).toISOString();
}
