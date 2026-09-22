import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { usePantry } from '../lib/db/usePantry';
import { AddPantryItemForm } from '../components/AddPantryItemForm';
import { PantryItem } from '../lib/types';

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
        <Link href="/recipes" asChild>
          <Pressable style={StyleSheet.flatten([styles.actionButton, styles.recipesButton])}>
            <Text style={styles.actionButtonText}>🍳 Suggest recipes</Text>
          </Pressable>
        </Link>
      </View>

      <AddPantryItemForm onAdd={handleAdd} />

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Your pantry is empty. Add or scan something.</Text> : null
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
  actionButton: { flex: 1, backgroundColor: '#1565c0', padding: 12, borderRadius: 10, alignItems: 'center' },
  recipesButton: { backgroundColor: '#ef6c00' },
  actionButtonText: { color: 'white', fontWeight: '600' },
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
