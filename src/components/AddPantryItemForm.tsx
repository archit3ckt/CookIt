import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { INGREDIENTS } from '../lib/rulesEngine/ingredients';
import { IngredientDef, Unit } from '../lib/types';

interface Props {
  onAdd: (args: { ingredient: IngredientDef; quantity: number; unit: Unit; daysUntilExpiry: number }) => void;
}

export function AddPantryItemForm({ onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<IngredientDef | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [days, setDays] = useState('');

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return INGREDIENTS.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const submit = () => {
    if (!selected) return;
    const qty = Number(quantity) || 1;
    const daysUntilExpiry = days.trim() ? Number(days) : selected.defaultShelfLifeDays;
    onAdd({ ingredient: selected, quantity: qty, unit: 'piece', daysUntilExpiry });
    setQuery('');
    setSelected(null);
    setQuantity('1');
    setDays('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add ingredient</Text>
      <TextInput
        style={styles.input}
        placeholder="Search ingredient (e.g. chicken)"
        value={selected ? selected.name : query}
        onChangeText={(t) => {
          setSelected(null);
          setQuery(t);
        }}
      />
      {matches.length > 0 && !selected && (
        <FlatList
          data={matches}
          keyExtractor={(i) => i.id}
          style={styles.suggestions}
          renderItem={({ item }) => (
            <Pressable style={styles.suggestionRow} onPress={() => setSelected(item)}>
              <Text>{item.name}</Text>
            </Pressable>
          )}
        />
      )}
      {selected && (
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Qty"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder={`Days left (default ${selected.defaultShelfLifeDays})`}
            keyboardType="numeric"
            value={days}
            onChangeText={setDays}
          />
          <Pressable style={styles.addButton} onPress={submit}>
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, gap: 8 },
  label: { fontWeight: '600', fontSize: 14, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  smallInput: { flex: 1 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  suggestions: { maxHeight: 180, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  suggestionRow: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  addButton: { backgroundColor: '#2e7d32', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addButtonText: { color: 'white', fontWeight: '600' },
});
