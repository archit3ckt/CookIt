import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { usePantry } from '../../lib/db/usePantry';
import { AddPantryItemForm } from '../../components/AddPantryItemForm';
import { SearchBar } from '../../components/SearchBar';
import { PantryItem } from '../../lib/types';

function daysLeft(expiresOn: string | null): number | null {
  if (!expiresOn) return null;
  const ms = new Date(expiresOn).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ expiresOn }: { expiresOn: string | null }) {
  const left = daysLeft(expiresOn);
  if (left === null) return <Text style={styles.badgeNeutral}>no expiry set</Text>;
  if (left <= 2) return <Text style={styles.badgeUrgent}>{left <= 0 ? 'expired' : `${left}d left`}</Text>;
  if (left <= 6) return <Text style={styles.badgeSoon}>{left}d left</Text>;
  return <Text style={styles.badgeFine}>{left}d left</Text>;
}

export default function PantryScreen() {
  const { items, loading, addItem, removeItem } = usePantry();
  const [search, setSearch] = useState('');

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, search]);

  const handleAdd = useCallback(
    async ({
      ingredient,
      quantity,
      unit,
      daysUntilExpiry,
    }: {
      ingredient: { id: string; name: string };
      quantity: number;
      unit: PantryItem['unit'];
      daysUntilExpiry: number;
    }) => {
      const expiresOn = new Date();
      expiresOn.setDate(expiresOn.getDate() + daysUntilExpiry);
      await addItem({
        id: Crypto.randomUUID(),
        ingredientId: ingredient.id,
        label: ingredient.name,
        quantity,
        unit,
        expiresOn: expiresOn.toISOString().slice(0, 10),
        addedOn: new Date().toISOString().slice(0, 10),
        source: 'manual',
      });
    },
    [addItem]
  );

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Link href="/scan" asChild>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📷 Scan receipt / barcode</Text>
          </Pressable>
        </Link>
      </View>

      <AddPantryItemForm onAdd={handleAdd} />

      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search pantry items" />
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              {search.trim() ? 'No pantry items match your search.' : 'Your pantry is empty. Add or scan something.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowMeta}>
                {item.quantity} {item.unit !== 'piece' ? item.unit : ''} · <ExpiryBadge expiresOn={item.expiresOn} />
              </Text>
            </View>
            <Pressable onPress={() => removeItem(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  actions: { flexDirection: 'row', gap: 8, padding: 12 },
  actionButton: { flex: 1, backgroundColor: '#1565c0', padding: 12, borderRadius: 20, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: '600' },
  searchWrap: { paddingHorizontal: 12, paddingBottom: 8 },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowMain: { gap: 2 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowMeta: { fontSize: 13, color: '#666' },
  removeText: { color: '#c62828', fontSize: 13 },
  badgeUrgent: { color: '#c62828', fontWeight: '700' },
  badgeSoon: { color: '#ef6c00', fontWeight: '600' },
  badgeFine: { color: '#2e7d32' },
  badgeNeutral: { color: '#999' },
});
