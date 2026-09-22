import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS pantry_items (
      id TEXT PRIMARY KEY NOT NULL,
      ingredientId TEXT NOT NULL,
      label TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      expiresOn TEXT,
      addedOn TEXT NOT NULL,
      source TEXT NOT NULL
    );
  `);
}
