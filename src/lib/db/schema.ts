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
    CREATE TABLE IF NOT EXISTS made_recipes (
      id TEXT PRIMARY KEY NOT NULL,
      recipeId TEXT NOT NULL,
      title TEXT NOT NULL,
      technique TEXT NOT NULL,
      ingredientIds TEXT NOT NULL,
      steps TEXT NOT NULL,
      estimatedMinutes INTEGER NOT NULL,
      difficulty INTEGER NOT NULL,
      healthScore REAL NOT NULL,
      macros TEXT NOT NULL,
      madeOn TEXT NOT NULL,
      liked INTEGER NOT NULL DEFAULT 0
    );
  `);
}
