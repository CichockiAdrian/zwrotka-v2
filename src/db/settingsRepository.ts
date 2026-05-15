// src/db/settingsRepository.ts
import { getDb } from './client';
import type { AppSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

export async function getAllSettings(): Promise<AppSettings> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const stored = Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]));
  return { ...DEFAULT_SETTINGS, ...stored } as AppSettings;
}

export async function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key, JSON.stringify(value)
  );
}
