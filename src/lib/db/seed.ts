import { type SQLiteDatabase } from 'expo-sqlite';
import { INGREDIENTS_BY_ID } from '../rulesEngine/ingredients';

interface SeedPantryItem {
  ingredientId: string;
  label: string;
  quantity: number;
  /** null means no expiry date, same as a manually-added item where the user left it blank. */
  daysUntilExpiry: number | null;
}

// A realistic, varied pantry: some items expiring in the next couple of days (exercises the
// waste-score sort), some mid-range, some shelf-stable with no expiry — and enough of the named
// dish signatures' ingredients (see namedDishes.ts) to actually surface a few named suggestions
// like Chicken Piccata and Garlic Butter Shrimp instead of only generic combos. Units come from
// INGREDIENTS_BY_ID at insert time rather than being hand-typed here, so this data can't drift
// out of sync with each ingredient's canonical unit.
const SEED_PANTRY: SeedPantryItem[] = [
  { ingredientId: 'chicken-breast', label: 'Chicken Breast', quantity: 2, daysUntilExpiry: 3 },
  { ingredientId: 'butter', label: 'Butter', quantity: 200, daysUntilExpiry: 30 },
  { ingredientId: 'lemon', label: 'Lemon', quantity: 3, daysUntilExpiry: 10 },
  { ingredientId: 'garlic', label: 'Garlic', quantity: 1, daysUntilExpiry: 20 },
  { ingredientId: 'shrimp', label: 'Shrimp', quantity: 300, daysUntilExpiry: 2 },
  { ingredientId: 'salmon', label: 'Salmon Fillet', quantity: 2, daysUntilExpiry: 2 },
  { ingredientId: 'dill', label: 'Fresh Dill', quantity: 15, daysUntilExpiry: 5 },
  { ingredientId: 'onion', label: 'Onion', quantity: 4, daysUntilExpiry: 25 },
  { ingredientId: 'carrot', label: 'Carrot', quantity: 5, daysUntilExpiry: 14 },
  { ingredientId: 'potato', label: 'Potato', quantity: 6, daysUntilExpiry: 20 },
  { ingredientId: 'olive-oil', label: 'Olive Oil', quantity: 500, daysUntilExpiry: 180 },
  { ingredientId: 'eggs', label: 'Eggs', quantity: 12, daysUntilExpiry: 14 },
  { ingredientId: 'spinach', label: 'Spinach', quantity: 200, daysUntilExpiry: 4 },
  { ingredientId: 'tomato', label: 'Tomato', quantity: 5, daysUntilExpiry: 6 },
  { ingredientId: 'cheddar', label: 'Cheddar Cheese', quantity: 250, daysUntilExpiry: 21 },
  { ingredientId: 'pasta', label: 'Pasta', quantity: 500, daysUntilExpiry: null },
  { ingredientId: 'rice', label: 'Rice', quantity: 1000, daysUntilExpiry: null },
  { ingredientId: 'mushroom', label: 'Mushroom', quantity: 250, daysUntilExpiry: 3 },
  { ingredientId: 'red-wine', label: 'Red Wine', quantity: 750, daysUntilExpiry: 60 },
  { ingredientId: 'tortilla', label: 'Tortilla', quantity: 6, daysUntilExpiry: 10 },
  { ingredientId: 'bulgur', label: 'Bulgur', quantity: 300, daysUntilExpiry: 300 },
  { ingredientId: 'beef-steak', label: 'Beef Steak', quantity: 2, daysUntilExpiry: 4 },
];

const SEED_MADE_RECIPES = [
  {
    title: 'Chicken Piccata',
    technique: 'saute' as const,
    ingredientIds: ['chicken-breast', 'butter', 'lemon'],
    steps: [
      'Pound chicken breast to even thickness and season with salt and pepper.',
      'Sear in butter over medium-high heat, 3-4 minutes per side, then set aside.',
      'Deglaze the pan with lemon juice, scraping up the browned bits.',
      'Swirl in more butter off heat and spoon the sauce over the chicken.',
    ],
    estimatedMinutes: 25,
    difficulty: 2 as const,
    healthScore: 0.65,
    macros: { calories: 210, proteinG: 26, carbsG: 2, fatG: 11, sodiumMg: 380 },
    daysAgo: 3,
    liked: true,
  },
  {
    title: 'Garlic Butter Shrimp',
    technique: 'saute' as const,
    ingredientIds: ['shrimp', 'butter', 'garlic'],
    steps: [
      'Melt butter in a hot skillet and add minced garlic, cooking until fragrant.',
      'Add shrimp in a single layer and cook 1-2 minutes per side until pink.',
      'Toss to coat in the garlic butter and serve immediately.',
    ],
    estimatedMinutes: 15,
    difficulty: 1 as const,
    healthScore: 0.6,
    macros: { calories: 180, proteinG: 20, carbsG: 1, fatG: 10, sodiumMg: 420 },
    daysAgo: 1,
    liked: false,
  },
];

function isoDaysFromNow(days: number | null): string | null {
  if (days === null) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Populates an empty dev database with a realistic pantry (and a couple of
 * "made" recipes) so the app isn't blank on first run. Only ever inserts into
 * a table it finds empty, so it can't clobber real data or duplicate on
 * every relaunch. Callers are expected to gate this behind __DEV__.
 */
export async function seedDevData(db: SQLiteDatabase): Promise<void> {
  const pantryCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM pantry_items');
  if (pantryCount && pantryCount.count === 0) {
    const addedOn = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < SEED_PANTRY.length; i++) {
      const item = SEED_PANTRY[i];
      const unit = INGREDIENTS_BY_ID[item.ingredientId]?.unit ?? 'unknown';
      await db.runAsync(
        `INSERT INTO pantry_items (id, ingredientId, label, quantity, unit, expiresOn, addedOn, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `seed-pantry-${i}`,
          item.ingredientId,
          item.label,
          item.quantity,
          unit,
          isoDaysFromNow(item.daysUntilExpiry),
          addedOn,
          'manual',
        ]
      );
    }
  }

  const madeCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM made_recipes');
  if (madeCount && madeCount.count === 0) {
    for (let i = 0; i < SEED_MADE_RECIPES.length; i++) {
      const r = SEED_MADE_RECIPES[i];
      await db.runAsync(
        `INSERT INTO made_recipes (id, recipeId, title, technique, ingredientIds, steps, estimatedMinutes, difficulty, healthScore, macros, madeOn, liked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `seed-made-${i}`,
          `seed-${r.technique}-${r.ingredientIds.join('-')}`,
          r.title,
          r.technique,
          JSON.stringify(r.ingredientIds),
          JSON.stringify(r.steps),
          r.estimatedMinutes,
          r.difficulty,
          r.healthScore,
          JSON.stringify(r.macros),
          isoDaysFromNow(-r.daysAgo),
          r.liked ? 1 : 0,
        ]
      );
    }
  }
}
