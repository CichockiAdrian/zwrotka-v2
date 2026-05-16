// src/db/client.ts
// Robust adapter for expo-sqlite that avoids Node.js startup crashes
// while maintaining compatibility with Expo Go (SDK 51).

let SQLite: any;

function getSQLite() {
  if (!SQLite) {
    // Detect if we are running in the native app (React Native) or in Node.js (CLI/Bundler)
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      // In the app, use the legacy bridge of version 14 (compatible with Expo Go)
      SQLite = require('expo-sqlite/legacy');
    } else {
      // In Node.js (CLI), return a mock to prevent resolution crashes
      SQLite = {
        openDatabase: () => ({
          transaction: () => ({ executeSql: () => {} }),
          readTransaction: () => ({ executeSql: () => {} }),
        }),
      };
    }
  }
  return SQLite;
}

export async function getDb(): Promise<any> {
  const sql = getSQLite();
  const db = sql.openDatabase('zwrotka.db');
  
  // Initialize schema if needed
  db.transaction((tx: any) => {
    tx.executeSql('PRAGMA foreign_keys = ON;');
    tx.executeSql(`
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
    `);
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_vouchers_status  ON vouchers(status);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);');
  });
  
  return db;
}

export async function queryAll<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.readTransaction((tx: any) => {
      tx.executeSql(sql, args, (_: any, res: any) => resolve(res.rows._array), (_: any, err: any) => { reject(err); return false; });
    }, (err: any) => reject(err));
  });
}

export async function queryFirst<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const rows = await queryAll<T>(sql, args);
  return rows[0] ?? null;
}

export async function execute(sql: string, args: any[] = []): Promise<any> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(sql, args, (_: any, res: any) => resolve(res), (_: any, err: any) => { reject(err); return false; });
    }, (err: any) => reject(err));
  });
}

export async function executeMany(statements: { sql: string; args?: any[] }[]): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      for (const { sql, args = [] } of statements) {
        tx.executeSql(sql, args, undefined, (_: any, err: any) => { reject(err); return false; });
      }
    }, (err: any) => reject(err), () => resolve());
  });
}
