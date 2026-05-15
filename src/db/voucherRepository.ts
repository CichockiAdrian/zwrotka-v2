// src/db/voucherRepository.ts
import { getDb } from './client';
import type { Voucher, CreateVoucherInput, UpdateVoucherInput, VoucherSortKey } from '@/types/voucher';
import { generateId, nowISO } from '@/utils/date';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToVoucher(row: any): Voucher {
  return {
    id: row.id,
    code: row.code,
    codeFormat: row.code_format,
    valueGrosze: row.value_grosze,
    label: row.label,
    storeName: row.store_name,
    status: row.status,
    source: row.source,
    issuedAt: row.issued_at,
    expiresAt: row.expires_at ?? null,
    usedAt: row.used_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: row.notes,
  };
}

export async function getAllVouchers(
  sortKey: VoucherSortKey = 'createdAt',
  direction: 'asc' | 'desc' = 'desc'
): Promise<Voucher[]> {
  const db = await getDb();
  const colMap: Record<VoucherSortKey, string> = {
    createdAt: 'created_at',
    valueGrosze: 'value_grosze',
    expiresAt: 'expires_at',
    storeName: 'store_name',
  };
  const rows = await db.getAllAsync(
    `SELECT * FROM vouchers ORDER BY ${colMap[sortKey]} ${direction.toUpperCase()}`
  );
  return rows.map(rowToVoucher);
}

export async function getVoucherById(id: string): Promise<Voucher | null> {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM vouchers WHERE id = ?', id);
  return row ? rowToVoucher(row) : null;
}

export async function createVoucher(input: CreateVoucherInput): Promise<Voucher> {
  const db = await getDb();
  const now = nowISO();
  const id = generateId();

  const v: Voucher = {
    id,
    code: input.code,
    codeFormat: input.codeFormat ?? 'unknown',
    valueGrosze: input.valueGrosze,
    label: input.label ?? '',
    storeName: input.storeName ?? '',
    status: 'active',
    source: input.source ?? 'manual',
    issuedAt: input.issuedAt ?? now,
    expiresAt: input.expiresAt ?? null,
    usedAt: null,
    createdAt: now,
    updatedAt: now,
    notes: input.notes ?? '',
  };

  await db.runAsync(
    `INSERT INTO vouchers
       (id,code,code_format,value_grosze,label,store_name,status,source,
        issued_at,expires_at,used_at,created_at,updated_at,notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    v.id, v.code, v.codeFormat, v.valueGrosze, v.label, v.storeName,
    v.status, v.source, v.issuedAt, v.expiresAt, v.usedAt,
    v.createdAt, v.updatedAt, v.notes
  );
  return v;
}

export async function updateVoucher(id: string, input: UpdateVoucherInput): Promise<Voucher | null> {
  const db = await getDb();
  const now = nowISO();

  const fieldMap: Record<string, string> = {
    label: 'label', storeName: 'store_name', notes: 'notes',
    expiresAt: 'expires_at', valueGrosze: 'value_grosze', status: 'status',
  };

  const sets = ['updated_at = ?'];
  const vals: (string | number | null)[] = [now];

  for (const [k, col] of Object.entries(fieldMap)) {
    const v = (input as Record<string, unknown>)[k];
    if (v !== undefined) { sets.push(`${col} = ?`); vals.push(v as string | number | null); }
  }

  if (input.status === 'used') { sets.push('used_at = ?'); vals.push(now); }

  vals.push(id);
  await db.runAsync(`UPDATE vouchers SET ${sets.join(', ')} WHERE id = ?`, ...vals);
  return getVoucherById(id);
}

export async function deleteVoucher(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM vouchers WHERE id = ?', id);
}

export async function expireOverdueVouchers(): Promise<number> {
  const db = await getDb();
  const now = nowISO();
  const r = await db.runAsync(
    `UPDATE vouchers SET status='expired', updated_at=?
     WHERE status='active' AND expires_at IS NOT NULL AND expires_at < ?`,
    now, now
  );
  return r.changes;
}

export async function getVoucherCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM vouchers');
  return row?.count ?? 0;
}

export async function seedIfEmpty(seeds: CreateVoucherInput[]): Promise<void> {
  const count = await getVoucherCount();
  if (count > 0) return;
  for (const s of seeds) await createVoucher(s);
  // Manually set statuses for used/expired seed vouchers
  const db = await getDb();
  const all = await db.getAllAsync<{ id: string; label: string }>('SELECT id, label FROM vouchers');
  for (const row of all) {
    if (row.label.includes('[USED]')) {
      await db.runAsync(`UPDATE vouchers SET status='used', used_at=updated_at WHERE id=?`, row.id);
      await db.runAsync(`UPDATE vouchers SET label=REPLACE(label,'[USED]','') WHERE id=?`, row.id);
    }
    if (row.label.includes('[EXPIRED]')) {
      await db.runAsync(`UPDATE vouchers SET status='expired' WHERE id=?`, row.id);
      await db.runAsync(`UPDATE vouchers SET label=REPLACE(label,'[EXPIRED]','') WHERE id=?`, row.id);
    }
  }
}
