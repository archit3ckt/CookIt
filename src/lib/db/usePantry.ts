import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { PantryItem } from '../types';
import { deletePantryItem, insertPantryItem, listPantryItems } from './pantry';

export function usePantry() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const rows = await listPantryItems(db);
    setItems(rows);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    // Initial load from SQLite on mount — synchronizing with an external
    // system, the documented exception to "don't setState in an effect".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // Bottom tabs keep every tab screen mounted, and each screen calls this hook
  // independently with its own state — so a pantry edit made on one screen
  // (e.g. removing an item on the Pantry tab) never reaches another screen's
  // copy (e.g. Suggestions) without this. Refetching on focus keeps every
  // consumer in sync with SQLite without introducing shared/global state.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addItem = useCallback(
    async (item: PantryItem) => {
      await insertPantryItem(db, item);
      await refresh();
    },
    [db, refresh]
  );

  const removeItem = useCallback(
    async (id: string) => {
      await deletePantryItem(db, id);
      await refresh();
    },
    [db, refresh]
  );

  return { items, loading, addItem, removeItem, refresh };
}
