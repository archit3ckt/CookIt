import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getCachedRecipe } from '../../lib/recipeCache';
import { INGREDIENTS_BY_ID } from '../../lib/rulesEngine/ingredients';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = id ? getCachedRecipe(id) : undefined;

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
        {recipe.estimatedMinutes} min · {'★'.repeat(recipe.difficulty)} difficulty
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
  sectionHeader: { fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  ingredient: { fontSize: 15, color: '#333' },
  step: { fontSize: 15, color: '#333', marginBottom: 8, lineHeight: 21 },
});
