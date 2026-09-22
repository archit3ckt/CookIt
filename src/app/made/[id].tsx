import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMadeRecipes } from '../../lib/db/useMadeRecipes';
import { INGREDIENTS_BY_ID } from '../../lib/rulesEngine/ingredients';
import { healthLabel } from '../../lib/rulesEngine/rank';

export default function MadeRecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, loading, setLiked } = useMadeRecipes();
  const recipe = items.find((r) => r.id === id);

  if (loading) return null;

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>Made recipe not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Pressable hitSlop={8} onPress={() => setLiked(recipe.id, !recipe.liked)}>
          <Text style={styles.heart}>{recipe.liked ? '❤️' : '🤍'}</Text>
        </Pressable>
      </View>
      <Text style={styles.meta}>
        {recipe.estimatedMinutes} min · {'★'.repeat(recipe.difficulty)} difficulty · {healthLabel(recipe.healthScore)}
      </Text>
      <Text style={styles.dateNote}>Made {recipe.madeOn}</Text>

      <Text style={styles.sectionHeader}>Macros (avg per 100g across ingredients)</Text>
      <Text style={styles.macros}>
        {Math.round(recipe.macros.calories)} kcal · {recipe.macros.proteinG.toFixed(1)}g protein ·{' '}
        {recipe.macros.carbsG.toFixed(1)}g carbs · {recipe.macros.fatG.toFixed(1)}g fat ·{' '}
        {Math.round(recipe.macros.sodiumMg)}mg sodium
      </Text>

      <Text style={styles.sectionHeader}>Ingredients</Text>
      {recipe.ingredientIds.map((ingId) => (
        <Text key={ingId} style={styles.ingredient}>
          • {INGREDIENTS_BY_ID[ingId]?.name ?? ingId}
        </Text>
      ))}

      <Text style={styles.sectionHeader}>Steps</Text>
      {recipe.steps.map((step, idx) => (
        <Text key={idx} style={styles.step}>
          {idx + 1}. {step}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', flexShrink: 1 },
  heart: { fontSize: 24 },
  meta: { color: '#666' },
  dateNote: { color: '#999', fontSize: 12, marginBottom: 12 },
  sectionHeader: { fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  macros: { fontSize: 14, color: '#333' },
  ingredient: { fontSize: 15, color: '#333' },
  step: { fontSize: 15, color: '#333', marginBottom: 8, lineHeight: 21 },
});
