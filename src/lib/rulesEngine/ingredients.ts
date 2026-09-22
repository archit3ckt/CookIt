import { IngredientDef } from '../types';

/**
 * Seed ingredient knowledge base: roles + a hand-curated pairing graph encoding
 * classic flavor-pairing rules (shared aromatic compounds / cuisine convention).
 * This is the "chef's heuristics" data the generator combines at runtime.
 */
export const INGREDIENTS: IngredientDef[] = [
  // Proteins
  { id: 'chicken-breast', name: 'Chicken breast', roles: ['protein'], pairsWith: ['garlic', 'lemon', 'onion', 'butter', 'thyme', 'olive-oil'], defaultShelfLifeDays: 2 },
  { id: 'eggs', name: 'Eggs', roles: ['protein', 'fat'], pairsWith: ['butter', 'cheese', 'spinach', 'onion', 'tomato'], defaultShelfLifeDays: 21 },
  { id: 'ground-beef', name: 'Ground beef', roles: ['protein'], pairsWith: ['onion', 'garlic', 'tomato', 'cumin', 'chili'], defaultShelfLifeDays: 2 },
  { id: 'tofu', name: 'Tofu', roles: ['protein'], pairsWith: ['soy-sauce', 'ginger', 'garlic', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 7 },
  { id: 'salmon', name: 'Salmon', roles: ['protein', 'fat'], pairsWith: ['lemon', 'dill', 'butter', 'garlic', 'soy-sauce'], defaultShelfLifeDays: 2 },
  { id: 'chickpeas', name: 'Chickpeas', roles: ['protein', 'starch'], pairsWith: ['cumin', 'garlic', 'lemon', 'olive-oil', 'onion'], defaultShelfLifeDays: 365 },

  // Fats
  { id: 'butter', name: 'Butter', roles: ['fat', 'dairy'], pairsWith: ['garlic', 'thyme', 'lemon', 'onion'], defaultShelfLifeDays: 60 },
  { id: 'olive-oil', name: 'Olive oil', roles: ['fat'], pairsWith: ['garlic', 'lemon', 'tomato', 'basil'], defaultShelfLifeDays: 365 },
  { id: 'sesame-oil', name: 'Sesame oil', roles: ['fat'], pairsWith: ['soy-sauce', 'ginger', 'scallion', 'garlic'], defaultShelfLifeDays: 365 },

  // Acids
  { id: 'lemon', name: 'Lemon', roles: ['acid'], pairsWith: ['garlic', 'butter', 'olive-oil', 'thyme', 'dill'], defaultShelfLifeDays: 21 },
  { id: 'lime', name: 'Lime', roles: ['acid'], pairsWith: ['cilantro', 'chili', 'garlic'], defaultShelfLifeDays: 21 },
  { id: 'vinegar', name: 'Vinegar', roles: ['acid'], pairsWith: ['olive-oil', 'onion', 'garlic'], defaultShelfLifeDays: 730 },
  { id: 'tomato', name: 'Tomato', roles: ['acid', 'vegetable'], pairsWith: ['basil', 'garlic', 'olive-oil', 'onion'], defaultShelfLifeDays: 5 },

  // Aromatics
  { id: 'garlic', name: 'Garlic', roles: ['aromatic'], pairsWith: ['onion', 'olive-oil', 'butter', 'ginger'], defaultShelfLifeDays: 90 },
  { id: 'onion', name: 'Onion', roles: ['aromatic'], pairsWith: ['garlic', 'butter', 'olive-oil'], defaultShelfLifeDays: 30 },
  { id: 'ginger', name: 'Ginger', roles: ['aromatic'], pairsWith: ['garlic', 'soy-sauce', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 21 },
  { id: 'scallion', name: 'Scallion', roles: ['aromatic'], pairsWith: ['ginger', 'soy-sauce', 'sesame-oil'], defaultShelfLifeDays: 10 },
  { id: 'cilantro', name: 'Cilantro', roles: ['aromatic'], pairsWith: ['lime', 'chili', 'garlic'], defaultShelfLifeDays: 7 },

  // Starches
  { id: 'rice', name: 'Rice', roles: ['starch'], pairsWith: ['soy-sauce', 'sesame-oil', 'ginger', 'scallion'], defaultShelfLifeDays: 365 },
  { id: 'pasta', name: 'Pasta', roles: ['starch'], pairsWith: ['tomato', 'basil', 'garlic', 'olive-oil'], defaultShelfLifeDays: 365 },
  { id: 'potato', name: 'Potato', roles: ['starch', 'vegetable'], pairsWith: ['butter', 'garlic', 'thyme'], defaultShelfLifeDays: 30 },
  { id: 'tortilla', name: 'Tortilla', roles: ['starch'], pairsWith: ['cumin', 'chili', 'cilantro', 'lime'], defaultShelfLifeDays: 14 },

  // Vegetables
  { id: 'spinach', name: 'Spinach', roles: ['vegetable'], pairsWith: ['garlic', 'butter', 'eggs', 'lemon'], defaultShelfLifeDays: 5 },
  { id: 'bell-pepper', name: 'Bell pepper', roles: ['vegetable'], pairsWith: ['onion', 'garlic', 'soy-sauce'], defaultShelfLifeDays: 10 },
  { id: 'broccoli', name: 'Broccoli', roles: ['vegetable'], pairsWith: ['garlic', 'soy-sauce', 'sesame-oil'], defaultShelfLifeDays: 7 },
  { id: 'carrot', name: 'Carrot', roles: ['vegetable'], pairsWith: ['ginger', 'butter', 'onion'], defaultShelfLifeDays: 21 },
  { id: 'zucchini', name: 'Zucchini', roles: ['vegetable'], pairsWith: ['garlic', 'olive-oil', 'basil'], defaultShelfLifeDays: 7 },

  // Dairy
  { id: 'cheese', name: 'Cheese (cheddar/parm)', roles: ['dairy'], pairsWith: ['eggs', 'pasta', 'tomato', 'potato'], defaultShelfLifeDays: 30 },
  { id: 'cream', name: 'Cream', roles: ['dairy', 'fat'], pairsWith: ['garlic', 'onion', 'butter'], defaultShelfLifeDays: 10 },

  // Spices / seasonings
  { id: 'thyme', name: 'Thyme', roles: ['spice'], pairsWith: ['chicken-breast', 'butter', 'garlic', 'potato'], defaultShelfLifeDays: 14 },
  { id: 'dill', name: 'Dill', roles: ['spice'], pairsWith: ['salmon', 'lemon', 'cream'], defaultShelfLifeDays: 10 },
  { id: 'basil', name: 'Basil', roles: ['spice'], pairsWith: ['tomato', 'olive-oil', 'pasta'], defaultShelfLifeDays: 7 },
  { id: 'cumin', name: 'Cumin', roles: ['spice'], pairsWith: ['chickpeas', 'ground-beef', 'onion', 'chili'], defaultShelfLifeDays: 365 },
  { id: 'chili', name: 'Chili flakes', roles: ['spice'], pairsWith: ['garlic', 'lime', 'ginger'], defaultShelfLifeDays: 365 },
  { id: 'soy-sauce', name: 'Soy sauce', roles: ['spice', 'liquid'], pairsWith: ['ginger', 'garlic', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 730 },
];

export const INGREDIENTS_BY_ID: Record<string, IngredientDef> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i])
);

export function findIngredientByLabel(label: string): IngredientDef | null {
  const normalized = label.trim().toLowerCase();
  return (
    INGREDIENTS.find((i) => i.name.toLowerCase() === normalized) ??
    INGREDIENTS.find(
      (i) => normalized.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(normalized)
    ) ??
    null
  );
}
