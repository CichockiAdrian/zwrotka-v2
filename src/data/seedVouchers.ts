// src/data/seedVouchers.ts
import type { CreateVoucherInput } from '@/types/voucher';
import { isoFromDaysAgo, isoFromDaysFromNow } from '@/utils/date';

export const SEED_VOUCHERS: CreateVoucherInput[] = [
  // AKTYWNE — wygasający wkrótce (jutro) — jak w screenshocie
  {
    code: 'BIEDRONKA2024050801',
    codeFormat: 'code128',
    valueGrosze: 1250,      // 12.50 zł
    label: 'Biedronka 08.05',
    storeName: 'Biedronka',
    issuedAt: isoFromDaysAgo(6),
    expiresAt: isoFromDaysFromNow(1), // wygasa jutro!
    notes: '',
    source: 'seed',
  },
  // AKTYWNY — Lidl
  {
    code: 'LIDL2024050802',
    codeFormat: 'qr',
    valueGrosze: 875,       // 8.75 zł
    label: 'Lidl 08.05',
    storeName: 'Lidl',
    issuedAt: isoFromDaysAgo(4),
    expiresAt: isoFromDaysFromNow(15),
    notes: '',
    source: 'seed',
  },
  // AKTYWNY — Kaufland (9.00 zł - jak na screenshocie fullscreen)
  {
    code: 'LIDL2024050501',
    codeFormat: 'qr',
    valueGrosze: 900,       // 9.00 zł
    label: 'Lidl 05.05',
    storeName: 'Lidl',
    issuedAt: isoFromDaysAgo(10),
    expiresAt: isoFromDaysFromNow(20),
    notes: '',
    source: 'seed',
  },
  // AKTYWNY — Kaufland
  {
    code: 'KAUFLAND2024050803',
    codeFormat: 'code128',
    valueGrosze: 1725,      // 17.25 zł
    label: 'Kaufland 08.05',
    storeName: 'Kaufland',
    issuedAt: isoFromDaysAgo(8),
    expiresAt: isoFromDaysFromNow(20),
    notes: '',
    source: 'seed',
  },
  // WYGASŁY — Biedronka
  {
    code: 'BIEDRONKA2024050701',
    codeFormat: 'code128',
    valueGrosze: 550,       // 5.50 zł
    label: '[EXPIRED]Biedronka 07.05',
    storeName: 'Biedronka',
    issuedAt: isoFromDaysAgo(30),
    expiresAt: isoFromDaysAgo(5),
    notes: '',
    source: 'seed',
  },
  // UŻYTY — Lidl
  {
    code: 'LIDL2024050601',
    codeFormat: 'qr',
    valueGrosze: 900,       // 9.00 zł
    label: '[USED]Lidl 06.05',
    storeName: 'Lidl',
    issuedAt: isoFromDaysAgo(15),
    expiresAt: isoFromDaysFromNow(45),
    notes: '',
    source: 'seed',
  },
];
