// src/db/client.ts
import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('zwrotka.db');
  await migrate(_db);
  return _db;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id           TEXT    PRIMARY KEY NOT NULL,
      code         TEXT    NOT NULL,
      code_format  TEXT    NOT NULL DEFAULT 'unknown',
      value_grosze INTEGER NOT NULL DEFAULT 0,
      label        TEXT    NOT NULL DEFAULT '',
      store_name   TEXT    NOT NULL DEFAULT '',
      status       TEXT    NOT NULL DEFAULT 'active',
      source       TEXT    NOT NULL DEFAULT 'manual',
      issued_at    TEXT    NOT NULL,
      expires_at   TEXT,
      used_at      TEXT,
      created_at   TEXT    NOT NULL,
      updated_at   TEXT    NOT NULL,
      notes        TEXT    NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_vouchers_status  ON vouchers(status);
    CREATE INDEX IF NOT EXISTS idx_vouchers_created ON vouchers(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_vouchers_expires ON vouchers(expires_at);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}
