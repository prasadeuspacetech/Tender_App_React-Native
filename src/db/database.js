// src/db/database.js
//
// Opens and holds ONE shared SQLite connection for the entire app.
// All repositories import `getDB()` — never `openDatabase()` directly.
//
// Usage:
//   import { getDB, initDatabase } from '../db/database';

import * as SQLite from 'expo-sqlite';
import { runMigrations } from './schema';

// ─── Module-level singleton ───────────────────────────────────────────────────
let _db = null;

// ─── Open (or return cached) database ────────────────────────────────────────
export const getDB = () => {
  if (!_db) {
    // expo-sqlite v14+ (SDK 50+) uses openDatabaseSync
    _db = SQLite.openDatabaseSync('tender_tracking.db');
  }
  return _db;
};

// ─── Bootstrap: call once at app startup (App.js / RootNavigator) ────────────
// Runs schema migrations, then resolves.
export const initDatabase = async () => {
  try {
    const db = getDB();
    await runMigrations(db);
    console.log('[DB] Database ready');
  } catch (error) {
    console.error('[DB] Initialization failed:', error);
    throw error;
  }
};