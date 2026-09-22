import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMadeRecipes } from '../../lib/db/useMadeRecipes';
import { healthLabel } from '../../lib/rulesEngine/rank';

export default function DiscoveredScreen() {
  const { items, loading, setLiked } = useMadeRecipes();
  const [likedOnly, setLikedOnly] = useState(false);

  const visible = useMemo(() => (likedOnly ? items.filter((r) => r.liked) : items), [items, likedOnly]);

  if (loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, !likedOnly && styles.filterChipActive]}
          onPress={() => setLikedOnly(false)}
        >
          <Text style={!likedOnly ? styles.filterTextActive : styles.filterText}>All made</Text>
        </Pressable>
        <Pressable
          style={[styles.filterChip, likedOnly && styles.filterChipActive]}
          onPress={() => setLikedOnly(true)}
        >
          <Text style={likedOnly ? styles.filterTextActive : styles.filterText}>❤️ Liked</Text>
        </Pressable>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {likedOnly
              ? "You haven't liked any made dishes yet."
              : "Nothing here yet — mark a suggested recipe as made once you've cooked it."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/made/${item.id}`)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Pressable hitSlop={8} onPress={() => setLiked(item.id, !item.liked)}>
                <Text style={styles.heart}>{item.liked ? '❤️' : '🤍'}</Text>
              </Pressable>
            </View>
            <Text style={styles.cardMeta}>
              {item.estimatedMinutes} min · {'★'.repeat(item.difficulty)} · {healthLabel(item.healthScore)}
            </Text>
            <Text style={styles.cardDate}>Made {item.madeOn}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12, gap: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  filterChipActive: { backgroundColor: '#1565c0' },
  filterText: { color: '#333' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { paddingVertical: 12, gap: 10 },
  card: { backgroundColor: '#fafafa', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#eee', gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  heart: { fontSize: 18 },
  cardMeta: { fontSize: 13, color: '#666' },
  cardDate: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, paddingHorizontal: 20 },
});
