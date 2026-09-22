import { GeneratedRecipe, IngredientRole, PantryItem } from '../types';
import { INGREDIENTS_BY_ID } from './ingredients';

/**
 * Some ingredients are only partially consumed by a recipe, leaving a
 * byproduct that goes to waste unless something else uses it — egg whites
 * for a meringue leave yolks behind; yolks for a custard leave whites. This
 * registry drives two things: (1) synthesizing "you could separate this"
 * virtual pantry entries so whites/yolks-only techniques have something to
 * draw on in the first place, and (2) suggesting a companion recipe that
 * uses whichever half the chosen one doesn't, after generation.
 *
 * Deliberately generic rather than eggs-specific, so a future split (citrus
 * zest vs. juice, buttermilk vs. butter, ...) is just another entry here.
 */
export interface ByproductPair {
  sourceIngredientId: string;
  componentAId: string;
  componentARole: IngredientRole;
  componentBId: string;
  componentBRole: IngredientRole;
}

export const BYPRODUCT_PAIRS: ByproductPair[] = [
  {
    sourceIngredientId: 'eggs',
    componentAId: 'egg-white',
    componentARole: 'egg-white',
    componentBId: 'egg-yolk',
    componentBRole: 'egg-yolk',
  },
];

function estimatedExpiry(componentIngredientId: string): string {
  const def = INGREDIENTS_BY_ID[componentIngredientId];
  const date = new Date();
  date.setDate(date.getDate() + (def?.defaultShelfLifeDays ?? 3));
  return date.toISOString().slice(0, 10);
}

/**
 * Adds "you could separate this" virtual pantry entries for whole
 * ingredients that have a registered split, so whites/yolks-only techniques
 * have candidates to pick from. These are synthesized fresh on every call,
 * not persisted — separating eggs is a per-recipe decision, not pantry state.
 */
export function deriveVirtualPantryItems(pantryItems: PantryItem[]): PantryItem[] {
  const derived: PantryItem[] = [];
  for (const pair of BYPRODUCT_PAIRS) {
    for (const source of pantryItems.filter((p) => p.ingredientId === pair.sourceIngredientId)) {
      for (const componentId of [pair.componentAId, pair.componentBId]) {
        derived.push({
          ...source,
          id: `${source.id}-${componentId}`,
          ingredientId: componentId,
          label: `${INGREDIENTS_BY_ID[componentId]?.name ?? componentId} (from ${source.label})`,
          expiresOn: estimatedExpiry(componentId),
        });
      }
    }
  }
  return derived;
}

/**
 * After generation, cross-links recipes that use opposite halves of the
 * same split ingredient by mutating pairedRecipeId/pairedRecipeNote on both.
 * Only suggested when the real pantry has the whole source ingredient —
 * that's what implies a leftover half; a pantry that separately owns
 * pre-separated whites or yolks isn't assumed to be wasting anything.
 */
export function pairByproductRecipes(recipes: GeneratedRecipe[], pantryItems: PantryItem[]): void {
  for (const pair of BYPRODUCT_PAIRS) {
    const hasSource = pantryItems.some((p) => p.ingredientId === pair.sourceIngredientId);
    if (!hasSource) continue;

    const usesA = recipes.filter((r) => r.ingredientIds.includes(pair.componentAId));
    const usesB = recipes.filter((r) => r.ingredientIds.includes(pair.componentBId));
    if (usesA.length === 0 || usesB.length === 0) continue;

    const bestA = [...usesA].sort((x, y) => y.balanceScore - x.balanceScore)[0];
    const bestB = [...usesB].sort((x, y) => y.balanceScore - x.balanceScore)[0];
    const nameA = (INGREDIENTS_BY_ID[pair.componentAId]?.name ?? pair.componentAId).toLowerCase();
    const nameB = (INGREDIENTS_BY_ID[pair.componentBId]?.name ?? pair.componentBId).toLowerCase();

    for (const r of usesA) {
      if (r.id === bestB.id) continue;
      r.pairedRecipeId = bestB.id;
      r.pairedRecipeNote = `Uses ${nameA} only — pair with "${bestB.title}" to use the leftover ${nameB}.`;
    }
    for (const r of usesB) {
      if (r.id === bestA.id) continue;
      r.pairedRecipeId = bestA.id;
      r.pairedRecipeNote = `Uses ${nameB} only — pair with "${bestA.title}" to use the leftover ${nameA}.`;
    }
  }
}
