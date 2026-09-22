import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { getCachedRecipe } from '../../lib/recipeCache';
import { INGREDIENTS_BY_ID } from '../../lib/rulesEngine/ingredients';
import { healthLabel } from '../../lib/rulesEngine/rank';
import { useMadeRecipes } from '../../lib/db/useMadeRecipes';
import { usePantry } from '../../lib/db/usePantry';
import { Unit } from '../../lib/types';

const DEFAULT_SERVINGS = 2;

function formatQty(qty: number, unit: Unit): string {
  if (unit === 'piece') {
    const rounded = Math.round(qty * 2) / 2;
    const label = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    return `${label} ${rounded === 1 ? 'pc' : 'pcs'}`;
  }
  return `${Math.round(qty)}${unit}`;
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = id ? getCachedRecipe(id) : undefined;
  const pairedRecipe = recipe?.pairedRecipeId ? getCachedRecipe(recipe.pairedRecipeId) : undefined;
  const { addMade } = useMadeRecipes();
  const { items: pantryItems } = usePantry();
  const [marked, setMarked] = useState(false);
  const [servings, setServings] = useState(DEFAULT_SERVINGS);

  const pantryQtyByIngredient = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of pantryItems) {
      map.set(p.ingredientId, (map.get(p.ingredientId) ?? 0) + p.quantity);
    }
    return map;
  }, [pantryItems]);

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>Recipe not found — go back and regenerate from the Recipes tab.</Text>
      </View>
    );
  }

  const handleMarkAsMade = async () => {
    await addMade({
      id: Crypto.randomUUID(),
      recipeId: recipe.id,
      title: recipe.title,
      technique: recipe.technique,
      ingredientIds: recipe.ingredientIds,
      steps: recipe.steps,
      estimatedMinutes: recipe.estimatedMinutes,
      difficulty: recipe.difficulty,
      healthScore: recipe.healthScore,
      macros: recipe.macros,
      madeOn: new Date().toISOString().slice(0, 10),
      liked: false,
    });
    setMarked(true);
  };

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

      <View style={styles.servingsRow}>
        <Text style={styles.sectionHeaderInline}>Ingredients</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepperBtn}
            onPress={() => setServings((s) => Math.max(1, s - 1))}
            hitSlop={8}
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </Pressable>
          <Text style={styles.stepperLabel}>{servings} {servings === 1 ? 'serving' : 'servings'}</Text>
          <Pressable style={styles.stepperBtn} onPress={() => setServings((s) => s + 1)} hitSlop={8}>
            <Text style={styles.stepperBtnText}>+</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.macrosNote}>
        Quantities are a rough sizing guide, not precise measurements — treat shortfalls as a soft nudge, not a hard
        limit.
      </Text>
      {recipe.ingredients.map((ing) => {
        const needed = ing.perServingQty * servings;
        const have = pantryQtyByIngredient.get(ing.ingredientId) ?? 0;
        const short = Math.max(0, needed - have);
        return (
          <Text key={ing.ingredientId} style={styles.ingredient}>
            • {INGREDIENTS_BY_ID[ing.ingredientId]?.name ?? ing.ingredientId} — need {formatQty(needed, ing.unit)} ·
            have {formatQty(have, ing.unit)}
            {short > 0 && <Text style={styles.shortfall}> (short {formatQty(short, ing.unit)})</Text>}
          </Text>
        );
      })}

      <Text style={styles.sectionHeader}>Steps</Text>
      {recipe.steps.map((step, idx) => (
        <Text key={idx} style={styles.step}>
          {idx + 1}. {step}
        </Text>
      ))}

      <Pressable
        style={[styles.madeButton, marked && styles.madeButtonDone]}
        disabled={marked}
        onPress={handleMarkAsMade}
      >
        <Text style={styles.madeButtonText}>{marked ? '✓ Marked as made' : '✓ Mark as made'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700' },
  meta: { color: '#666', marginBottom: 12 },
  madeButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  madeButtonDone: { backgroundColor: '#9e9e9e' },
  madeButtonText: { color: '#fff', fontWeight: '600' },
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
  sectionHeaderInline: { fontSize: 15, fontWeight: '700' },
  macros: { fontSize: 14, color: '#333' },
  macrosNote: { fontSize: 12, color: '#999', marginTop: 2, marginBottom: 6 },
  ingredient: { fontSize: 15, color: '#333' },
  shortfall: { color: '#c62828', fontWeight: '600' },
  step: { fontSize: 15, color: '#333', marginBottom: 8, lineHeight: 21 },
  servingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 16, fontWeight: '700', color: '#1565c0' },
  stepperLabel: { fontSize: 13, color: '#333', fontWeight: '600', minWidth: 66, textAlign: 'center' },
});
