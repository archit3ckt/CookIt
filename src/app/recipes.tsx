import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { usePantry } from '../lib/db/usePantry';
import { generateRecipes } from '../lib/rulesEngine/generate';
import { filterAndSort } from '../lib/rulesEngine/rank';
import { cacheRecipes } from '../lib/recipeCache';
import { RecipeSort } from '../lib/types';

const SORTS: { key: RecipeSort; label: string }[] = [
  { key: 'waste', label: 'Reduce waste' },
  { key: 'time', label: 'Fastest' },
  { key: 'ease', label: 'Easiest' },
];

export default function RecipesScreen() {
  const { items, loading } = usePantry();
  const [sort, setSort] = useState<RecipeSort>('waste');
  const [maxMinutes, setMaxMinutes] = useState<number | undefined>(undefined);

  const recipes = useMemo(() => {
    const generated = generateRecipes(items);
    cacheRecipes(generated);
    return filterAndSort(generated, sort, { maxMinutes });
  }, [items, sort, maxMinutes]);

  if (loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sortRow}>
        {SORTS.map((s) => (
          <Pressable
            key={s.key}
            style={[styles.sortChip, sort === s.key && styles.sortChipActive]}
            onPress={() => setSort(s.key)}
          >
            <Text style={sort === s.key ? styles.sortTextActive : styles.sortText}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.sortRow}>
        {[undefined, 20, 30, 60].map((m) => (
          <Pressable
            key={String(m)}
            style={[styles.sortChip, maxMinutes === m && styles.sortChipActive]}
            onPress={() => setMaxMinutes(m)}
          >
            <Text style={maxMinutes === m ? styles.sortTextActive : styles.sortText}>
              {m ? `≤${m} min` : 'Any time'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Not enough pantry items to build a balanced recipe yet. Add a protein, a fat, and an aromatic to get
            started.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/recipe/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.estimatedMinutes} min · {'★'.repeat(item.difficulty)}
              {item.wasteScore > 0.5 ? ' · uses items expiring soon' : ''}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12, gap: 8 },
  sortRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sortChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  sortChipActive: { backgroundColor: '#1565c0' },
  sortText: { color: '#333' },
  sortTextActive: { color: '#fff', fontWeight: '600' },
  list: { paddingVertical: 12, gap: 10 },
  card: { backgroundColor: '#fafafa', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#eee', gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: '#666' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, paddingHorizontal: 20 },
});
