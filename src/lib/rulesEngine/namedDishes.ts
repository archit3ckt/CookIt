import { Technique } from '../types';

/**
 * Non-AI dish naming: a curated signature registry, matched against what the
 * generator actually produced. Each entry lists a technique plus the
 * "defining" ingredient ids that must ALL be present (subset match — extra
 * ingredients in the generated recipe don't break a match) for that name to
 * apply. Deliberately not exhaustive or AI-driven: this can only ever
 * recognize dishes someone thought to catalog here, unlike an LLM asked
 * "does this look like a known dish" — that's the real tradeoff against the
 * AI-naming alternative, made explicit rather than hidden.
 *
 * Every ingredient id used below must be pickable by that technique (i.e.
 * its role must appear in the technique's required+optional role set, or a
 * composite technique's component role sets) — otherwise the signature can
 * never actually match anything the generator produces. This is checked in
 * generate.test-data validation during development, not at runtime.
 */
export interface NamedDishSignature {
  name: string;
  technique: Technique;
  requiredIngredientIds: string[];
}

export const NAMED_DISHES: NamedDishSignature[] = [
  // ---- saute ----
  { name: 'Chicken Piccata', technique: 'saute', requiredIngredientIds: ['chicken-breast', 'butter', 'lemon'] },
  { name: 'Garlic Butter Shrimp', technique: 'saute', requiredIngredientIds: ['shrimp', 'butter', 'garlic'] },
  { name: 'Salmon with Dill', technique: 'saute', requiredIngredientIds: ['salmon', 'butter', 'dill'] },

  // ---- roast ----
  { name: 'Roast Lamb with Potatoes', technique: 'roast', requiredIngredientIds: ['lamb', 'potato', 'rosemary'] },

  // ---- braise (no spice-role support — keep signatures to liquid/acid/vegetable/aromatic combos) ----
  { name: 'Beef Bourguignon', technique: 'braise', requiredIngredientIds: ['beef-steak', 'red-wine', 'mushroom'] },
  { name: 'Coq au Vin', technique: 'braise', requiredIngredientIds: ['chicken-thigh', 'red-wine', 'mushroom'] },
  { name: 'Pot Roast', technique: 'braise', requiredIngredientIds: ['beef-steak', 'chicken-stock', 'carrot'] },

  // ---- stir-fry ----
  { name: 'Pad Thai', technique: 'stir-fry', requiredIngredientIds: ['rice-noodles', 'fish-sauce', 'peanuts'] },
  { name: 'Fried Rice', technique: 'stir-fry', requiredIngredientIds: ['rice', 'soy-sauce', 'scallion'] },

  // ---- raw-salad (no spice-role support) ----
  { name: 'Greek Salad', technique: 'raw-salad', requiredIngredientIds: ['feta', 'cucumber', 'tomato'] },
  { name: 'Caprese Salad', technique: 'raw-salad', requiredIngredientIds: ['mozzarella', 'tomato', 'balsamic-vinegar'] },
  { name: 'Cucumber Yogurt Salad', technique: 'raw-salad', requiredIngredientIds: ['cucumber', 'greek-yogurt'] },

  // ---- simmer-soup (no spice-role, no dairy/fat support) ----
  { name: 'Chicken Noodle Soup', technique: 'simmer-soup', requiredIngredientIds: ['chicken-stock', 'chicken-breast', 'carrot', 'pasta'] },
  { name: 'Minestrone', technique: 'simmer-soup', requiredIngredientIds: ['vegetable-stock', 'carrot', 'celery', 'tomato'] },
  { name: 'Tom Yum Soup', technique: 'simmer-soup', requiredIngredientIds: ['lemongrass', 'chili', 'shrimp'] },

  // ---- grill ----
  { name: 'Chimichurri Steak', technique: 'grill', requiredIngredientIds: ['beef-steak', 'parsley', 'vinegar'] },
  { name: 'Lemon Herb Chicken', technique: 'grill', requiredIngredientIds: ['chicken-breast', 'lemon', 'rosemary'] },

  // ---- bake ----
  { name: 'Mac and Cheese', technique: 'bake', requiredIngredientIds: ['pasta', 'cheddar'] },
  { name: 'Lasagna', technique: 'bake', requiredIngredientIds: ['pasta', 'mozzarella', 'tomato', 'ground-beef'] },
  { name: 'Potato Gratin', technique: 'bake', requiredIngredientIds: ['potato', 'cheddar'] },

  // ---- steam ----
  { name: 'Steamed Vegetables with Lemon', technique: 'steam', requiredIngredientIds: ['broccoli', 'lemon'] },

  // ---- poach ----
  { name: 'Poached Eggs', technique: 'poach', requiredIngredientIds: ['eggs'] },
  { name: 'Poached Salmon', technique: 'poach', requiredIngredientIds: ['salmon'] },
  { name: 'Poached Chicken', technique: 'poach', requiredIngredientIds: ['chicken-breast'] },

  // ---- deep-fry ----
  { name: 'Fried Chicken', technique: 'deep-fry', requiredIngredientIds: ['chicken-thigh'] },
  { name: 'Fish and Chips', technique: 'deep-fry', requiredIngredientIds: ['cod', 'potato'] },
  { name: 'Fried Shrimp', technique: 'deep-fry', requiredIngredientIds: ['shrimp'] },

  // ---- blend ----
  { name: 'Gazpacho', technique: 'blend', requiredIngredientIds: ['tomato', 'cucumber', 'bell-pepper'] },
  { name: 'Green Smoothie', technique: 'blend', requiredIngredientIds: ['kale', 'milk'] },
  { name: 'Butternut Squash Soup', technique: 'blend', requiredIngredientIds: ['butternut-squash', 'vegetable-stock', 'cream'] },

  // ---- cake / meringue / custard ----
  { name: 'Vanilla Cake', technique: 'cake', requiredIngredientIds: ['vanilla-extract'] },
  { name: 'Meringue Cookies', technique: 'meringue', requiredIngredientIds: [] },
  { name: 'Vanilla Custard', technique: 'custard', requiredIngredientIds: ['vanilla-extract'] },

  // ---- kubbeh (composite; technique alone is already a distinct enough name) ----
  { name: 'Kubbeh Soup', technique: 'kubbeh', requiredIngredientIds: [] },

  // ---- shawarma (composite; protein-specific naming) ----
  { name: 'Chicken Shawarma', technique: 'shawarma', requiredIngredientIds: ['chicken-thigh'] },
  { name: 'Lamb Shawarma', technique: 'shawarma', requiredIngredientIds: ['lamb'] },
  { name: 'Beef Shawarma', technique: 'shawarma', requiredIngredientIds: ['beef-steak'] },
];

/**
 * Best (most specific — most matched ids) named-dish match for a generated
 * recipe, or null if nothing in the registry fits. Subset match: the
 * recipe can have extra ingredients beyond a signature's defining set.
 */
export function matchNamedDish(technique: Technique, ingredientIds: string[]): string | null {
  const idSet = new Set(ingredientIds);
  let best: NamedDishSignature | null = null;
  for (const sig of NAMED_DISHES) {
    if (sig.technique !== technique) continue;
    if (!sig.requiredIngredientIds.every((id) => idSet.has(id))) continue;
    if (!best || sig.requiredIngredientIds.length > best.requiredIngredientIds.length) {
      best = sig;
    }
  }
  return best?.name ?? null;
}
