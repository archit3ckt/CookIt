import { type SQLiteDatabase } from 'expo-sqlite';
import { PantryItem } from '../types';

export async function listPantryItems(db: SQLiteDatabase): Promise<PantryItem[]> {
  return db.getAllAsync<PantryItem>('SELECT * FROM pantry_items ORDER BY expiresOn IS NULL, expiresOn ASC');
}

export async function insertPantryItem(db: SQLiteDatabase, item: PantryItem): Promise<void> {
  await db.runAsync(
    `INSERT INTO pantry_items (id, ingredientId, label, quantity, unit, expiresOn, addedOn, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [item.id, item.ingredientId, item.label, item.quantity, item.unit, item.expiresOn, item.addedOn, item.source]
  );
}

export async function deletePantryItem(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM pantry_items WHERE id = ?', [id]);
}
