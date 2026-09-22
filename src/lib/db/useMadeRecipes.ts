import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { MadeRecipe } from '../types';
import { insertMadeRecipe, listMadeRecipes, setMadeRecipeLiked } from './madeRecipes';

export function useMadeRecipes() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<MadeRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const rows = await listMadeRecipes(db);
    setItems(rows);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    // Initial load from SQLite on mount — synchronizing with an external
    // system, the documented exception to "don't setState in an effect".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // Same cross-screen staleness fix as usePantry: e.g. marking a recipe as
  // made on the recipe detail screen won't reach the Discovered tab's own
  // copy of this hook's state without refetching on focus.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addMade = useCallback(
    async (recipe: MadeRecipe) => {
      await insertMadeRecipe(db, recipe);
      await refresh();
    },
    [db, refresh]
  );

  const setLiked = useCallback(
    async (id: string, liked: boolean) => {
      await setMadeRecipeLiked(db, id, liked);
      await refresh();
    },
    [db, refresh]
  );

  return { items, loading, addMade, setLiked, refresh };
}
