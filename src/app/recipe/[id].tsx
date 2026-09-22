import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getCachedRecipe } from '../../lib/recipeCache';
import { INGREDIENTS_BY_ID } from '../../lib/rulesEngine/ingredients';
import { healthLabel } from '../../lib/rulesEngine/rank';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = id ? getCachedRecipe(id) : undefined;
  const pairedRecipe = recipe?.pairedRecipeId ? getCachedRecipe(recipe.pairedRecipeId) : undefined;

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>Recipe not found — go back and regenerate from the Recipes tab.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.meta}>
        {recipe.estimatedMinutes} min · {'★'.repeat(recipe.difficulty)} difficulty · {healthLabel(recipe.healthScore)}
      </Text>

      {recipe.pairedRecipeNote && (
        <Pressable
          style={styles.pairingCard}
          disabled={!pairedRecipe}
          onPress={() => pairedRecipe && router.push(`/recipe/${pairedRecipe.id}`)}
        >
          <Text style={styles.pairingText}>🥚 {recipe.pairedRecipeNote}</Text>
          {pairedRecipe && <Text style={styles.pairingLink}>View that recipe →</Text>}
        </Pressable>
      )}

      <Text style={styles.sectionHeader}>Macros (avg per 100g across ingredients)</Text>
      <Text style={styles.macros}>
        {Math.round(recipe.macros.calories)} kcal · {recipe.macros.proteinG.toFixed(1)}g protein ·{' '}
        {recipe.macros.carbsG.toFixed(1)}g carbs · {recipe.macros.fatG.toFixed(1)}g fat ·{' '}
        {Math.round(recipe.macros.sodiumMg)}mg sodium
      </Text>
      <Text style={styles.macrosNote}>
        Reference figure for comparing recipes, not a per-serving nutrition total.
      </Text>

      <Text style={styles.sectionHeader}>Ingredients</Text>
      {recipe.ingredientIds.map((id) => (
        <Text key={id} style={styles.ingredient}>
          • {INGREDIENTS_BY_ID[id]?.name ?? id}
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
  title: { fontSize: 20, fontWeight: '700' },
  meta: { color: '#666', marginBottom: 12 },
  pairingCard: {
    backgroundColor: '#fff8e1',
    borderColor: '#f0d878',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  pairingText: { fontSize: 14, color: '#5d4a00' },
  pairingLink: { fontSize: 13, color: '#8a6d00', fontWeight: '600' },
  sectionHeader: { fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  macros: { fontSize: 14, color: '#333' },
  macrosNote: { fontSize: 12, color: '#999', marginTop: 2 },
  ingredient: { fontSize: 15, color: '#333' },
  step: { fontSize: 15, color: '#333', marginBottom: 8, lineHeight: 21 },
});
