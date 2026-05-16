// src/db/client.ts
// Modern SQLite adapter for Expo SDK 54+
import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  // In Node.js (CLI/Bundler), we return a mock or handle gracefully
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    dbInstance = await SQLite.openDatabaseAsync('zwrotka.db');
    
    // Initialize schema
    await dbInstance.execAsync(`
      PRAGMA foreign_keys = ON;
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
      CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    `);
    
    return dbInstance;
  } else {
    // Return a mock for non-native environments
    return {
      getAllAsync: async () => [],
      getFirstAsync: async () => null,
      runAsync: async () => ({ lastInsertRowId: 0, changes: 0 }),
      execAsync: async () => {},
      withTransactionAsync: async (cb: any) => await cb(),
    } as any;
  }
}

export async function queryAll<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const db = await getDb();
  return await db.getAllAsync(sql, args);
}

export async function queryFirst<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const db = await getDb();
  return await db.getFirstAsync(sql, args);
}

export async function execute(sql: string, args: any[] = []): Promise<any> {
  const db = await getDb();
  return await db.runAsync(sql, args);
}

export async function executeMany(statements: { sql: string; args?: any[] }[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const { sql, args = [] } of statements) {
      await db.runAsync(sql, args);
    }
  });
}
