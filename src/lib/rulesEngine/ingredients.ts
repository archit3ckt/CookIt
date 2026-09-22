import { IngredientDef, Unit } from '../types';

/**
 * Seed ingredient knowledge base: roles, a hand-curated flavor-pairing graph
 * (classic pairings / shared-cuisine convention), a simplified 0-1
 * healthScore heuristic (whole & nutrient-dense vs. processed/empty-calorie),
 * and reference macros per 100g (as typically eaten — cooked meat/veg, dried
 * spices as sold). None of this is a nutrition-facts or medical substitute —
 * this is the "chef's heuristics" data the generator combines at runtime; it
 * is not a recipe database.
 *
 * IDs are declared once as a const tuple (`INGREDIENT_ID_LIST`) and the seed
 * record below is typed against that tuple, so a typo'd id in `pairsWith` or
 * a missing/duplicate entry fails `tsc`, not silently degrades the pairing
 * graph at runtime.
 */
const INGREDIENT_ID_LIST = [
  // Proteins
  'chicken-breast', 'chicken-thigh', 'turkey', 'ground-beef', 'beef-steak', 'pork-chop', 'bacon', 'sausage',
  'lamb', 'duck', 'salmon', 'tuna', 'shrimp', 'cod', 'tilapia', 'mussels', 'tofu', 'tempeh', 'eggs',
  'chickpeas', 'black-beans', 'kidney-beans', 'lentils', 'greek-yogurt',
  // Fats
  'butter', 'olive-oil', 'sesame-oil', 'vegetable-oil', 'coconut-oil', 'ghee', 'avocado', 'tahini', 'mayonnaise',
  // Acids
  'lemon', 'lime', 'vinegar', 'rice-vinegar', 'balsamic-vinegar', 'white-wine', 'tamarind',
  // Aromatics
  'garlic', 'onion', 'shallot', 'ginger', 'scallion', 'leek', 'celery', 'cilantro', 'lemongrass', 'chili',
  // Starches
  'rice', 'brown-rice', 'pasta', 'potato', 'sweet-potato', 'tortilla', 'bread', 'quinoa', 'couscous',
  'rice-noodles', 'bulgur', 'oats', 'cornmeal',
  // Vegetables
  'tomato', 'spinach', 'kale', 'bell-pepper', 'broccoli', 'cauliflower', 'carrot', 'zucchini', 'eggplant',
  'mushroom', 'cabbage', 'brussels-sprouts', 'asparagus', 'green-beans', 'peas', 'corn', 'cucumber', 'radish',
  'beet', 'butternut-squash', 'pumpkin',
  // Dairy
  'cheddar', 'parmesan', 'feta', 'mozzarella', 'cream', 'milk', 'sour-cream',
  // Spices & herbs
  'thyme', 'dill', 'basil', 'cumin', 'chili-flakes', 'paprika', 'cinnamon', 'turmeric', 'black-pepper',
  'oregano', 'rosemary', 'mint', 'parsley', 'bay-leaf', 'curry-powder', 'five-spice-powder', 'cardamom',
  'nutmeg', 'coriander-seed', 'sage',
  // Sweeteners
  'sugar', 'honey', 'maple-syrup', 'brown-sugar',
  // Liquids & sauces
  'soy-sauce', 'fish-sauce', 'chicken-stock', 'vegetable-stock', 'coconut-milk', 'red-wine', 'hoisin-sauce',
  'oyster-sauce', 'sriracha', 'mustard', 'ketchup', 'worcestershire-sauce',
  // Nuts & seeds
  'peanuts', 'almonds', 'cashews', 'walnuts', 'sesame-seeds', 'pine-nuts',
  // Baking
  'flour', 'baking-powder', 'baking-soda', 'vanilla-extract',
  // Egg components (byproducts of separating whole eggs)
  'egg-white', 'egg-yolk',
] as const;

type SeedId = (typeof INGREDIENT_ID_LIST)[number];
type SeedEntry = Omit<IngredientDef, 'id' | 'pairsWith' | 'unit' | 'servingQty'> & { pairsWith: SeedId[] };

/** Shorthand: [calories, proteinG, carbsG, fatG, sodiumMg] per 100g. */
function m(calories: number, proteinG: number, carbsG: number, fatG: number, sodiumMg: number) {
  return { calories, proteinG, carbsG, fatG, sodiumMg };
}

const SEED: Record<SeedId, SeedEntry> = {
  // ---- Proteins ----
  'chicken-breast': { name: 'Chicken breast', roles: ['protein'], pairsWith: ['garlic', 'lemon', 'onion', 'butter', 'thyme', 'olive-oil', 'chicken-stock'], defaultShelfLifeDays: 2, healthScore: 0.8, macros: m(165, 31, 0, 3.6, 74) },
  'chicken-thigh': { name: 'Chicken thigh', roles: ['protein'], pairsWith: ['garlic', 'ginger', 'soy-sauce', 'paprika', 'onion'], defaultShelfLifeDays: 2, healthScore: 0.65, macros: m(209, 26, 0, 10.9, 90) },
  turkey: { name: 'Turkey', roles: ['protein'], pairsWith: ['sage', 'thyme', 'garlic', 'onion'], defaultShelfLifeDays: 2, healthScore: 0.8, macros: m(135, 30, 0, 1, 55) },
  'ground-beef': { name: 'Ground beef', roles: ['protein'], pairsWith: ['onion', 'garlic', 'tomato', 'cumin', 'chili-flakes'], defaultShelfLifeDays: 2, healthScore: 0.45, macros: m(250, 26, 0, 17, 75) },
  'beef-steak': { name: 'Beef steak', roles: ['protein'], pairsWith: ['garlic', 'butter', 'rosemary', 'black-pepper'], defaultShelfLifeDays: 3, healthScore: 0.5, macros: m(206, 29, 0, 9, 60) },
  'pork-chop': { name: 'Pork chop', roles: ['protein'], pairsWith: ['garlic', 'sage', 'thyme', 'mustard'], defaultShelfLifeDays: 3, healthScore: 0.55, macros: m(231, 26, 0, 14, 55) },
  bacon: { name: 'Bacon', roles: ['protein', 'fat'], pairsWith: ['eggs', 'potato', 'black-pepper', 'maple-syrup'], defaultShelfLifeDays: 7, healthScore: 0.25, macros: m(541, 37, 1.4, 42, 1717) },
  sausage: { name: 'Sausage', roles: ['protein'], pairsWith: ['onion', 'bell-pepper', 'mustard', 'cabbage'], defaultShelfLifeDays: 5, healthScore: 0.3, macros: m(301, 15, 2, 26, 900) },
  lamb: { name: 'Lamb', roles: ['protein'], pairsWith: ['garlic', 'rosemary', 'lemon', 'cumin'], defaultShelfLifeDays: 3, healthScore: 0.5, macros: m(258, 25, 0, 17, 72) },
  duck: { name: 'Duck', roles: ['protein'], pairsWith: ['five-spice-powder', 'ginger', 'scallion', 'hoisin-sauce'], defaultShelfLifeDays: 2, healthScore: 0.45, macros: m(337, 19, 0, 28, 63) },
  salmon: { name: 'Salmon', roles: ['protein', 'fat'], pairsWith: ['lemon', 'dill', 'butter', 'garlic', 'soy-sauce', 'white-wine'], defaultShelfLifeDays: 2, healthScore: 0.85, macros: m(208, 20, 0, 13, 59) },
  tuna: { name: 'Tuna', roles: ['protein'], pairsWith: ['soy-sauce', 'sesame-oil', 'lime', 'ginger'], defaultShelfLifeDays: 2, healthScore: 0.8, macros: m(116, 26, 0, 1, 247) },
  shrimp: { name: 'Shrimp', roles: ['protein'], pairsWith: ['garlic', 'lemon', 'chili', 'butter', 'cilantro'], defaultShelfLifeDays: 2, healthScore: 0.75, macros: m(99, 24, 0.2, 0.3, 111) },
  cod: { name: 'Cod', roles: ['protein'], pairsWith: ['lemon', 'butter', 'parsley', 'garlic'], defaultShelfLifeDays: 2, healthScore: 0.85, macros: m(105, 23, 0, 0.9, 78) },
  tilapia: { name: 'Tilapia', roles: ['protein'], pairsWith: ['lime', 'cumin', 'cilantro', 'chili'], defaultShelfLifeDays: 2, healthScore: 0.7, macros: m(128, 26, 0, 2.7, 56) },
  mussels: { name: 'Mussels', roles: ['protein'], pairsWith: ['garlic', 'white-wine', 'parsley', 'butter'], defaultShelfLifeDays: 2, healthScore: 0.75, macros: m(172, 24, 7, 4.5, 369) },
  tofu: { name: 'Tofu', roles: ['protein'], pairsWith: ['soy-sauce', 'ginger', 'garlic', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 7, healthScore: 0.8, macros: m(144, 15, 3, 9, 12) },
  tempeh: { name: 'Tempeh', roles: ['protein'], pairsWith: ['soy-sauce', 'ginger', 'garlic', 'lime'], defaultShelfLifeDays: 10, healthScore: 0.85, macros: m(192, 20, 8, 11, 9) },
  eggs: { name: 'Eggs', roles: ['protein', 'fat', 'egg'], pairsWith: ['butter', 'cheddar', 'spinach', 'onion', 'tomato', 'flour', 'sugar', 'vegetable-stock'], defaultShelfLifeDays: 21, healthScore: 0.75, macros: m(155, 13, 1.1, 11, 124) },
  chickpeas: { name: 'Chickpeas', roles: ['protein', 'starch'], pairsWith: ['cumin', 'garlic', 'lemon', 'olive-oil', 'onion'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(164, 9, 27, 2.6, 7) },
  'black-beans': { name: 'Black beans', roles: ['protein', 'starch'], pairsWith: ['cumin', 'lime', 'cilantro', 'chili'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(132, 8.9, 24, 0.5, 2) },
  'kidney-beans': { name: 'Kidney beans', roles: ['protein', 'starch'], pairsWith: ['cumin', 'tomato', 'onion', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(127, 8.7, 23, 0.5, 2) },
  lentils: { name: 'Lentils', roles: ['protein', 'starch'], pairsWith: ['cumin', 'turmeric', 'garlic', 'onion', 'vegetable-stock'], defaultShelfLifeDays: 365, healthScore: 0.9, macros: m(116, 9, 20, 0.4, 2) },
  'greek-yogurt': { name: 'Greek yogurt', roles: ['protein', 'dairy'], pairsWith: ['cucumber', 'mint', 'lemon', 'dill', 'honey'], defaultShelfLifeDays: 14, healthScore: 0.75, macros: m(73, 10, 3.6, 1.9, 36) },

  // ---- Fats ----
  butter: { name: 'Butter', roles: ['fat', 'dairy'], pairsWith: ['garlic', 'thyme', 'lemon', 'onion'], defaultShelfLifeDays: 60, healthScore: 0.35, macros: m(717, 0.9, 0.1, 81, 11) },
  'olive-oil': { name: 'Olive oil', roles: ['fat'], pairsWith: ['garlic', 'lemon', 'tomato', 'basil'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(884, 0, 0, 100, 2) },
  'sesame-oil': { name: 'Sesame oil', roles: ['fat'], pairsWith: ['soy-sauce', 'ginger', 'scallion', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.7, macros: m(884, 0, 0, 100, 0) },
  'vegetable-oil': { name: 'Vegetable oil', roles: ['fat'], pairsWith: ['garlic', 'onion', 'chili'], defaultShelfLifeDays: 365, healthScore: 0.45, macros: m(884, 0, 0, 100, 0) },
  'coconut-oil': { name: 'Coconut oil', roles: ['fat'], pairsWith: ['curry-powder', 'ginger', 'lime'], defaultShelfLifeDays: 365, healthScore: 0.4, macros: m(862, 0, 0, 100, 0) },
  ghee: { name: 'Ghee', roles: ['fat'], pairsWith: ['cumin', 'turmeric', 'garlic', 'onion'], defaultShelfLifeDays: 180, healthScore: 0.4, macros: m(900, 0.3, 0, 100, 2) },
  avocado: { name: 'Avocado', roles: ['fat', 'vegetable'], pairsWith: ['lime', 'cilantro', 'tomato', 'chili'], defaultShelfLifeDays: 5, healthScore: 0.85, macros: m(160, 2, 8.5, 15, 7) },
  tahini: { name: 'Tahini', roles: ['fat'], pairsWith: ['lemon', 'garlic', 'chickpeas', 'cumin'], defaultShelfLifeDays: 90, healthScore: 0.75, macros: m(595, 17, 21, 54, 115) },
  mayonnaise: { name: 'Mayonnaise', roles: ['fat'], pairsWith: ['lemon', 'mustard', 'garlic'], defaultShelfLifeDays: 60, healthScore: 0.3, macros: m(680, 1, 0.6, 75, 635) },

  // ---- Acids ----
  lemon: { name: 'Lemon', roles: ['acid'], pairsWith: ['garlic', 'butter', 'olive-oil', 'thyme', 'dill'], defaultShelfLifeDays: 21, healthScore: 0.9, macros: m(29, 1.1, 9.3, 0.3, 2) },
  lime: { name: 'Lime', roles: ['acid'], pairsWith: ['cilantro', 'chili', 'garlic'], defaultShelfLifeDays: 21, healthScore: 0.9, macros: m(30, 0.7, 11, 0.2, 2) },
  vinegar: { name: 'Vinegar', roles: ['acid'], pairsWith: ['olive-oil', 'onion', 'garlic'], defaultShelfLifeDays: 730, healthScore: 0.7, macros: m(18, 0, 0.4, 0, 2) },
  'rice-vinegar': { name: 'Rice vinegar', roles: ['acid'], pairsWith: ['soy-sauce', 'sesame-oil', 'ginger'], defaultShelfLifeDays: 730, healthScore: 0.65, macros: m(18, 0, 0.3, 0, 6) },
  'balsamic-vinegar': { name: 'Balsamic vinegar', roles: ['acid'], pairsWith: ['olive-oil', 'tomato', 'basil'], defaultShelfLifeDays: 730, healthScore: 0.6, macros: m(88, 0.5, 17, 0, 23) },
  'white-wine': { name: 'White wine', roles: ['acid', 'liquid'], pairsWith: ['garlic', 'butter', 'mussels', 'cream'], defaultShelfLifeDays: 5, healthScore: 0.4, macros: m(82, 0.1, 2.6, 0, 5) },
  tamarind: { name: 'Tamarind', roles: ['acid'], pairsWith: ['chili', 'garlic', 'cumin'], defaultShelfLifeDays: 180, healthScore: 0.7, macros: m(239, 2.8, 62, 0.6, 28) },

  // ---- Aromatics ----
  garlic: { name: 'Garlic', roles: ['aromatic'], pairsWith: ['onion', 'olive-oil', 'butter', 'ginger'], defaultShelfLifeDays: 90, healthScore: 0.9, macros: m(149, 6.4, 33, 0.5, 17) },
  onion: { name: 'Onion', roles: ['aromatic'], pairsWith: ['garlic', 'butter', 'olive-oil'], defaultShelfLifeDays: 30, healthScore: 0.85, macros: m(40, 1.1, 9.3, 0.1, 4) },
  shallot: { name: 'Shallot', roles: ['aromatic'], pairsWith: ['garlic', 'butter', 'white-wine'], defaultShelfLifeDays: 30, healthScore: 0.85, macros: m(72, 2.5, 17, 0.1, 12) },
  ginger: { name: 'Ginger', roles: ['aromatic'], pairsWith: ['garlic', 'soy-sauce', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 21, healthScore: 0.9, macros: m(80, 1.8, 18, 0.8, 13) },
  scallion: { name: 'Scallion', roles: ['aromatic'], pairsWith: ['ginger', 'soy-sauce', 'sesame-oil'], defaultShelfLifeDays: 10, healthScore: 0.85, macros: m(32, 1.8, 7.3, 0.2, 16) },
  leek: { name: 'Leek', roles: ['aromatic', 'vegetable'], pairsWith: ['butter', 'potato', 'chicken-stock'], defaultShelfLifeDays: 14, healthScore: 0.85, macros: m(61, 1.5, 14, 0.3, 20) },
  celery: { name: 'Celery', roles: ['aromatic', 'vegetable'], pairsWith: ['carrot', 'onion', 'chicken-stock'], defaultShelfLifeDays: 14, healthScore: 0.9, macros: m(16, 0.7, 3, 0.2, 80) },
  cilantro: { name: 'Cilantro', roles: ['aromatic'], pairsWith: ['lime', 'chili', 'garlic'], defaultShelfLifeDays: 7, healthScore: 0.9, macros: m(23, 2.1, 3.7, 0.5, 46) },
  lemongrass: { name: 'Lemongrass', roles: ['aromatic'], pairsWith: ['ginger', 'lime', 'coconut-milk', 'chili'], defaultShelfLifeDays: 14, healthScore: 0.85, macros: m(99, 1.8, 25, 0.5, 6) },
  chili: { name: 'Chili pepper', roles: ['aromatic', 'vegetable'], pairsWith: ['garlic', 'lime', 'ginger', 'cilantro'], defaultShelfLifeDays: 14, healthScore: 0.85, macros: m(40, 1.9, 9, 0.4, 9) },

  // ---- Starches ----
  rice: { name: 'Rice', roles: ['starch'], pairsWith: ['soy-sauce', 'sesame-oil', 'ginger', 'scallion'], defaultShelfLifeDays: 365, healthScore: 0.55, macros: m(130, 2.7, 28, 0.3, 1) },
  'brown-rice': { name: 'Brown rice', roles: ['starch'], pairsWith: ['soy-sauce', 'ginger', 'vegetable-stock'], defaultShelfLifeDays: 365, healthScore: 0.75, macros: m(123, 2.6, 26, 1, 4) },
  pasta: { name: 'Pasta', roles: ['starch'], pairsWith: ['tomato', 'basil', 'garlic', 'olive-oil', 'cheddar', 'parmesan'], defaultShelfLifeDays: 365, healthScore: 0.5, macros: m(131, 5, 25, 1.1, 1) },
  potato: { name: 'Potato', roles: ['starch', 'vegetable'], pairsWith: ['butter', 'garlic', 'thyme'], defaultShelfLifeDays: 30, healthScore: 0.6, macros: m(93, 2.5, 21, 0.1, 6) },
  'sweet-potato': { name: 'Sweet potato', roles: ['starch', 'vegetable'], pairsWith: ['cinnamon', 'butter', 'olive-oil', 'cumin'], defaultShelfLifeDays: 21, healthScore: 0.8, macros: m(90, 2, 21, 0.2, 36) },
  tortilla: { name: 'Tortilla', roles: ['starch'], pairsWith: ['cumin', 'chili', 'cilantro', 'lime'], defaultShelfLifeDays: 14, healthScore: 0.5, macros: m(310, 8, 51, 7, 600) },
  bread: { name: 'Bread', roles: ['starch'], pairsWith: ['butter', 'cheddar', 'olive-oil'], defaultShelfLifeDays: 7, healthScore: 0.45, macros: m(265, 9, 49, 3.2, 490) },
  quinoa: { name: 'Quinoa', roles: ['starch'], pairsWith: ['lemon', 'olive-oil', 'vegetable-stock', 'parsley'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(120, 4.4, 21, 1.9, 7) },
  couscous: { name: 'Couscous', roles: ['starch'], pairsWith: ['lemon', 'olive-oil', 'parsley', 'vegetable-stock'], defaultShelfLifeDays: 365, healthScore: 0.55, macros: m(112, 3.8, 23, 0.2, 5) },
  'rice-noodles': { name: 'Rice noodles', roles: ['starch'], pairsWith: ['soy-sauce', 'lime', 'fish-sauce', 'cilantro'], defaultShelfLifeDays: 365, healthScore: 0.5, macros: m(109, 0.9, 25, 0.2, 3) },
  bulgur: { name: 'Bulgur', roles: ['starch'], pairsWith: ['lemon', 'parsley', 'olive-oil', 'tomato'], defaultShelfLifeDays: 365, healthScore: 0.75, macros: m(83, 3.1, 19, 0.2, 5) },
  oats: { name: 'Oats', roles: ['starch'], pairsWith: ['milk', 'honey', 'cinnamon'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(389, 17, 66, 7, 2) },
  cornmeal: { name: 'Cornmeal', roles: ['starch'], pairsWith: ['butter', 'cheddar', 'chicken-stock'], defaultShelfLifeDays: 365, healthScore: 0.55, macros: m(370, 8, 79, 3.9, 5) },

  // ---- Vegetables ----
  tomato: { name: 'Tomato', roles: ['acid', 'vegetable'], pairsWith: ['basil', 'garlic', 'olive-oil', 'onion'], defaultShelfLifeDays: 5, healthScore: 0.85, macros: m(18, 0.9, 3.9, 0.2, 5) },
  spinach: { name: 'Spinach', roles: ['vegetable'], pairsWith: ['garlic', 'butter', 'eggs', 'lemon'], defaultShelfLifeDays: 5, healthScore: 0.95, macros: m(23, 2.9, 3.6, 0.4, 79) },
  kale: { name: 'Kale', roles: ['vegetable'], pairsWith: ['garlic', 'lemon', 'olive-oil', 'chili-flakes', 'milk'], defaultShelfLifeDays: 7, healthScore: 0.95, macros: m(49, 4.3, 9, 0.9, 38) },
  'bell-pepper': { name: 'Bell pepper', roles: ['vegetable'], pairsWith: ['onion', 'garlic', 'soy-sauce'], defaultShelfLifeDays: 10, healthScore: 0.9, macros: m(31, 1, 6, 0.3, 4) },
  broccoli: { name: 'Broccoli', roles: ['vegetable'], pairsWith: ['garlic', 'soy-sauce', 'sesame-oil', 'lemon'], defaultShelfLifeDays: 7, healthScore: 0.95, macros: m(34, 2.8, 7, 0.4, 33) },
  cauliflower: { name: 'Cauliflower', roles: ['vegetable'], pairsWith: ['garlic', 'cumin', 'turmeric', 'olive-oil'], defaultShelfLifeDays: 7, healthScore: 0.9, macros: m(25, 1.9, 5, 0.3, 30) },
  carrot: { name: 'Carrot', roles: ['vegetable'], pairsWith: ['ginger', 'butter', 'onion'], defaultShelfLifeDays: 21, healthScore: 0.85, macros: m(41, 0.9, 10, 0.2, 69) },
  zucchini: { name: 'Zucchini', roles: ['vegetable'], pairsWith: ['garlic', 'olive-oil', 'basil'], defaultShelfLifeDays: 7, healthScore: 0.85, macros: m(17, 1.2, 3.1, 0.3, 8) },
  eggplant: { name: 'Eggplant', roles: ['vegetable'], pairsWith: ['garlic', 'olive-oil', 'tomato', 'basil'], defaultShelfLifeDays: 7, healthScore: 0.8, macros: m(25, 1, 6, 0.2, 2) },
  mushroom: { name: 'Mushroom', roles: ['vegetable'], pairsWith: ['garlic', 'butter', 'thyme', 'white-wine'], defaultShelfLifeDays: 7, healthScore: 0.8, macros: m(22, 3.1, 3.3, 0.3, 5) },
  cabbage: { name: 'Cabbage', roles: ['vegetable'], pairsWith: ['vinegar', 'carrot', 'soy-sauce'], defaultShelfLifeDays: 21, healthScore: 0.85, macros: m(25, 1.3, 5.8, 0.1, 18) },
  'brussels-sprouts': { name: 'Brussels sprouts', roles: ['vegetable'], pairsWith: ['bacon', 'garlic', 'balsamic-vinegar'], defaultShelfLifeDays: 10, healthScore: 0.9, macros: m(43, 3.4, 9, 0.3, 25) },
  asparagus: { name: 'Asparagus', roles: ['vegetable'], pairsWith: ['lemon', 'garlic', 'olive-oil', 'parmesan'], defaultShelfLifeDays: 5, healthScore: 0.9, macros: m(20, 2.2, 3.9, 0.1, 2) },
  'green-beans': { name: 'Green beans', roles: ['vegetable'], pairsWith: ['garlic', 'almonds', 'butter'], defaultShelfLifeDays: 7, healthScore: 0.85, macros: m(31, 1.8, 7, 0.2, 6) },
  peas: { name: 'Peas', roles: ['vegetable'], pairsWith: ['mint', 'butter', 'garlic'], defaultShelfLifeDays: 7, healthScore: 0.8, macros: m(81, 5.4, 14, 0.4, 5) },
  corn: { name: 'Corn', roles: ['vegetable', 'starch'], pairsWith: ['butter', 'lime', 'chili'], defaultShelfLifeDays: 7, healthScore: 0.65, macros: m(96, 3.4, 21, 1.5, 15) },
  cucumber: { name: 'Cucumber', roles: ['vegetable'], pairsWith: ['greek-yogurt', 'mint', 'dill', 'lemon'], defaultShelfLifeDays: 7, healthScore: 0.85, macros: m(15, 0.7, 3.6, 0.1, 2) },
  radish: { name: 'Radish', roles: ['vegetable'], pairsWith: ['lime', 'cilantro', 'butter'], defaultShelfLifeDays: 14, healthScore: 0.85, macros: m(16, 0.7, 3.4, 0.1, 39) },
  beet: { name: 'Beet', roles: ['vegetable'], pairsWith: ['feta', 'olive-oil', 'balsamic-vinegar'], defaultShelfLifeDays: 21, healthScore: 0.8, macros: m(43, 1.6, 10, 0.2, 78) },
  'butternut-squash': { name: 'Butternut squash', roles: ['vegetable'], pairsWith: ['cinnamon', 'butter', 'sage', 'vegetable-stock', 'cream'], defaultShelfLifeDays: 30, healthScore: 0.8, macros: m(45, 1, 12, 0.1, 4) },
  pumpkin: { name: 'Pumpkin', roles: ['vegetable'], pairsWith: ['cinnamon', 'nutmeg', 'butter'], defaultShelfLifeDays: 30, healthScore: 0.8, macros: m(26, 1, 6.5, 0.1, 1) },

  // ---- Dairy ----
  cheddar: { name: 'Cheddar', roles: ['dairy'], pairsWith: ['eggs', 'potato', 'bread'], defaultShelfLifeDays: 30, healthScore: 0.45, macros: m(403, 25, 1.3, 33, 653) },
  parmesan: { name: 'Parmesan', roles: ['dairy'], pairsWith: ['pasta', 'tomato', 'basil', 'asparagus'], defaultShelfLifeDays: 60, healthScore: 0.5, macros: m(431, 38, 4.1, 29, 1529) },
  feta: { name: 'Feta', roles: ['dairy'], pairsWith: ['beet', 'cucumber', 'olive-oil', 'mint'], defaultShelfLifeDays: 30, healthScore: 0.5, macros: m(264, 14, 4, 21, 917) },
  mozzarella: { name: 'Mozzarella', roles: ['dairy'], pairsWith: ['tomato', 'basil', 'olive-oil'], defaultShelfLifeDays: 14, healthScore: 0.5, macros: m(280, 28, 3.1, 17, 627) },
  cream: { name: 'Cream', roles: ['dairy', 'fat'], pairsWith: ['garlic', 'onion', 'butter', 'mushroom'], defaultShelfLifeDays: 10, healthScore: 0.3, macros: m(340, 2.1, 2.8, 36, 38) },
  milk: { name: 'Milk', roles: ['dairy', 'liquid'], pairsWith: ['oats', 'honey', 'cinnamon', 'flour'], defaultShelfLifeDays: 7, healthScore: 0.6, macros: m(61, 3.2, 4.8, 3.3, 43) },
  'sour-cream': { name: 'Sour cream', roles: ['dairy'], pairsWith: ['potato', 'scallion', 'lime'], defaultShelfLifeDays: 21, healthScore: 0.35, macros: m(198, 2.4, 4.6, 19, 41) },

  // ---- Spices & herbs (dried spice-rack figures for dried spices; fresh-herb figures for fresh ones — per-serving amounts are gram-scale, so absolute contribution to a dish is small despite the concentrated per-100g numbers) ----
  thyme: { name: 'Thyme', roles: ['spice'], pairsWith: ['chicken-breast', 'butter', 'garlic', 'potato'], defaultShelfLifeDays: 14, healthScore: 0.9, macros: m(101, 5.6, 24, 1.7, 9) },
  dill: { name: 'Dill', roles: ['spice'], pairsWith: ['salmon', 'lemon', 'cream', 'cucumber'], defaultShelfLifeDays: 10, healthScore: 0.9, macros: m(43, 3.5, 7, 1.1, 61) },
  basil: { name: 'Basil', roles: ['spice'], pairsWith: ['tomato', 'olive-oil', 'pasta'], defaultShelfLifeDays: 7, healthScore: 0.9, macros: m(23, 3.2, 2.7, 0.6, 4) },
  cumin: { name: 'Cumin', roles: ['spice'], pairsWith: ['chickpeas', 'ground-beef', 'onion', 'chili-flakes'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(375, 18, 44, 22, 168) },
  'chili-flakes': { name: 'Chili flakes', roles: ['spice'], pairsWith: ['garlic', 'lime', 'ginger'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(282, 12, 50, 14, 30) },
  paprika: { name: 'Paprika', roles: ['spice'], pairsWith: ['chicken-thigh', 'potato', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(282, 14, 54, 13, 68) },
  cinnamon: { name: 'Cinnamon', roles: ['spice'], pairsWith: ['sweet-potato', 'oats', 'honey'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(247, 4, 81, 1.2, 10) },
  turmeric: { name: 'Turmeric', roles: ['spice'], pairsWith: ['ginger', 'garlic', 'coconut-milk', 'cauliflower'], defaultShelfLifeDays: 365, healthScore: 0.9, macros: m(312, 9.7, 67, 3.3, 38) },
  'black-pepper': { name: 'Black pepper', roles: ['spice'], pairsWith: ['beef-steak', 'garlic', 'butter'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(251, 10, 64, 3.3, 20) },
  oregano: { name: 'Oregano', roles: ['spice'], pairsWith: ['tomato', 'olive-oil', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.9, macros: m(265, 9, 69, 4.3, 25) },
  rosemary: { name: 'Rosemary', roles: ['spice'], pairsWith: ['beef-steak', 'lamb', 'garlic', 'olive-oil'], defaultShelfLifeDays: 14, healthScore: 0.9, macros: m(131, 3.3, 20, 5.9, 26) },
  mint: { name: 'Mint', roles: ['spice'], pairsWith: ['peas', 'cucumber', 'lamb', 'greek-yogurt'], defaultShelfLifeDays: 10, healthScore: 0.9, macros: m(44, 3.3, 8, 0.7, 31) },
  parsley: { name: 'Parsley', roles: ['spice'], pairsWith: ['lemon', 'garlic', 'olive-oil'], defaultShelfLifeDays: 10, healthScore: 0.9, macros: m(36, 3, 6.3, 0.8, 56) },
  'bay-leaf': { name: 'Bay leaf', roles: ['spice'], pairsWith: ['chicken-stock', 'onion', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(313, 7.6, 75, 8.4, 23) },
  'curry-powder': { name: 'Curry powder', roles: ['spice'], pairsWith: ['coconut-milk', 'ginger', 'garlic', 'chickpeas'], defaultShelfLifeDays: 365, healthScore: 0.8, macros: m(325, 14, 58, 14, 52) },
  'five-spice-powder': { name: 'Five-spice powder', roles: ['spice'], pairsWith: ['duck', 'soy-sauce', 'ginger'], defaultShelfLifeDays: 365, healthScore: 0.8, macros: m(300, 8, 60, 8, 30) },
  cardamom: { name: 'Cardamom', roles: ['spice'], pairsWith: ['cinnamon', 'rice', 'milk'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(311, 10.8, 68, 6.7, 18) },
  nutmeg: { name: 'Nutmeg', roles: ['spice'], pairsWith: ['pumpkin', 'cream', 'spinach'], defaultShelfLifeDays: 365, healthScore: 0.8, macros: m(525, 5.8, 49, 36, 16) },
  'coriander-seed': { name: 'Coriander seed', roles: ['spice'], pairsWith: ['cumin', 'lime', 'chicken-thigh'], defaultShelfLifeDays: 365, healthScore: 0.85, macros: m(298, 12, 55, 18, 35) },
  sage: { name: 'Sage', roles: ['spice'], pairsWith: ['turkey', 'pork-chop', 'butternut-squash', 'butter'], defaultShelfLifeDays: 10, healthScore: 0.9, macros: m(315, 10.6, 61, 12.8, 11) },

  // ---- Sweeteners ----
  sugar: { name: 'Sugar', roles: ['sweetener'], pairsWith: ['cinnamon', 'butter', 'flour', 'eggs'], defaultShelfLifeDays: 730, healthScore: 0.15, macros: m(387, 0, 100, 0, 1) },
  honey: { name: 'Honey', roles: ['sweetener'], pairsWith: ['greek-yogurt', 'lemon', 'mustard'], defaultShelfLifeDays: 730, healthScore: 0.35, macros: m(304, 0.3, 82, 0, 4) },
  'maple-syrup': { name: 'Maple syrup', roles: ['sweetener'], pairsWith: ['bacon', 'oats', 'cinnamon'], defaultShelfLifeDays: 365, healthScore: 0.35, macros: m(260, 0, 67, 0.1, 12) },
  'brown-sugar': { name: 'Brown sugar', roles: ['sweetener'], pairsWith: ['cinnamon', 'ginger'], defaultShelfLifeDays: 730, healthScore: 0.15, macros: m(380, 0.1, 98, 0, 28) },

  // ---- Liquids & sauces ----
  'soy-sauce': { name: 'Soy sauce', roles: ['spice', 'liquid'], pairsWith: ['ginger', 'garlic', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 730, healthScore: 0.45, macros: m(53, 8, 4.9, 0.6, 5493) },
  'fish-sauce': { name: 'Fish sauce', roles: ['spice', 'liquid'], pairsWith: ['lime', 'chili', 'garlic', 'lemongrass'], defaultShelfLifeDays: 730, healthScore: 0.45, macros: m(35, 5, 3.6, 0, 7851) },
  'chicken-stock': { name: 'Chicken stock', roles: ['liquid'], pairsWith: ['celery', 'carrot', 'onion', 'bay-leaf'], defaultShelfLifeDays: 5, healthScore: 0.65, macros: m(4, 0.6, 0.3, 0.1, 380) },
  'vegetable-stock': { name: 'Vegetable stock', roles: ['liquid'], pairsWith: ['celery', 'carrot', 'onion', 'lentils'], defaultShelfLifeDays: 5, healthScore: 0.75, macros: m(3, 0.3, 0.5, 0, 350) },
  'coconut-milk': { name: 'Coconut milk', roles: ['liquid', 'fat'], pairsWith: ['curry-powder', 'ginger', 'lemongrass', 'lime'], defaultShelfLifeDays: 5, healthScore: 0.5, macros: m(230, 2.3, 5.5, 24, 15) },
  'red-wine': { name: 'Red wine', roles: ['liquid', 'acid'], pairsWith: ['beef-steak', 'garlic', 'rosemary'], defaultShelfLifeDays: 5, healthScore: 0.4, macros: m(85, 0.1, 2.6, 0, 4) },
  'hoisin-sauce': { name: 'Hoisin sauce', roles: ['spice'], pairsWith: ['duck', 'scallion', 'five-spice-powder'], defaultShelfLifeDays: 180, healthScore: 0.3, macros: m(220, 2.6, 44, 3.4, 1090) },
  'oyster-sauce': { name: 'Oyster sauce', roles: ['spice'], pairsWith: ['broccoli', 'garlic', 'ginger'], defaultShelfLifeDays: 180, healthScore: 0.35, macros: m(51, 1.4, 11, 0.3, 2740) },
  sriracha: { name: 'Sriracha', roles: ['spice'], pairsWith: ['eggs', 'garlic', 'lime'], defaultShelfLifeDays: 365, healthScore: 0.55, macros: m(93, 1.9, 19, 0.9, 2124) },
  mustard: { name: 'Mustard', roles: ['spice'], pairsWith: ['pork-chop', 'honey', 'mayonnaise'], defaultShelfLifeDays: 365, healthScore: 0.7, macros: m(66, 4.4, 5.8, 3.3, 1135) },
  ketchup: { name: 'Ketchup', roles: ['spice'], pairsWith: ['ground-beef', 'potato'], defaultShelfLifeDays: 365, healthScore: 0.3, macros: m(101, 1.2, 26, 0.3, 907) },
  'worcestershire-sauce': { name: 'Worcestershire sauce', roles: ['spice'], pairsWith: ['beef-steak', 'ground-beef', 'mushroom'], defaultShelfLifeDays: 730, healthScore: 0.4, macros: m(78, 0, 19.5, 0, 980) },

  // ---- Nuts & seeds ----
  peanuts: { name: 'Peanuts', roles: ['fat', 'protein'], pairsWith: ['soy-sauce', 'lime', 'chili', 'cilantro'], defaultShelfLifeDays: 180, healthScore: 0.75, macros: m(567, 26, 16, 49, 18) },
  almonds: { name: 'Almonds', roles: ['fat'], pairsWith: ['green-beans', 'honey', 'cinnamon'], defaultShelfLifeDays: 180, healthScore: 0.85, macros: m(579, 21, 22, 50, 1) },
  cashews: { name: 'Cashews', roles: ['fat', 'protein'], pairsWith: ['soy-sauce', 'ginger', 'scallion'], defaultShelfLifeDays: 180, healthScore: 0.75, macros: m(553, 18, 30, 44, 12) },
  walnuts: { name: 'Walnuts', roles: ['fat'], pairsWith: ['beet', 'honey', 'feta'], defaultShelfLifeDays: 180, healthScore: 0.85, macros: m(654, 15, 14, 65, 2) },
  'sesame-seeds': { name: 'Sesame seeds', roles: ['fat'], pairsWith: ['sesame-oil', 'soy-sauce', 'broccoli'], defaultShelfLifeDays: 365, healthScore: 0.8, macros: m(573, 18, 23, 50, 11) },
  'pine-nuts': { name: 'Pine nuts', roles: ['fat'], pairsWith: ['basil', 'parmesan', 'olive-oil'], defaultShelfLifeDays: 180, healthScore: 0.8, macros: m(673, 14, 13, 68, 2) },

  // ---- Baking ----
  flour: { name: 'All-purpose flour', roles: ['flour'], pairsWith: ['sugar', 'butter', 'eggs', 'baking-powder', 'milk', 'vanilla-extract'], defaultShelfLifeDays: 365, healthScore: 0.45, macros: m(364, 10, 76, 1, 2) },
  'baking-powder': { name: 'Baking powder', roles: ['leavening'], pairsWith: ['flour'], defaultShelfLifeDays: 365, healthScore: 0.5, macros: m(53, 0, 28, 0, 10600) },
  'baking-soda': { name: 'Baking soda', roles: ['leavening'], pairsWith: ['flour', 'lemon', 'vinegar'], defaultShelfLifeDays: 730, healthScore: 0.5, macros: m(0, 0, 0, 0, 27360) },
  'vanilla-extract': { name: 'Vanilla extract', roles: ['spice'], pairsWith: ['sugar', 'flour', 'butter', 'eggs'], defaultShelfLifeDays: 1095, healthScore: 0.6, macros: m(288, 0.1, 13, 0.1, 9) },

  // ---- Egg components ----
  // Roles are deliberately narrow (just 'egg-white'/'egg-yolk', not also 'protein'/'fat'):
  // giving them the generic role too would let them get swept into unrelated savory
  // techniques (a "grilled egg white") since those only need *a* protein/fat, and would
  // corrupt the byproduct-pairing logic by making a nonsense recipe look like the best
  // companion for a whites-only or yolks-only one.
  'egg-white': { name: 'Egg white', roles: ['egg-white'], pairsWith: ['sugar', 'lemon', 'vanilla-extract'], defaultShelfLifeDays: 4, healthScore: 0.85, macros: m(52, 10.9, 0.7, 0.2, 166) },
  'egg-yolk': { name: 'Egg yolk', roles: ['egg-yolk'], pairsWith: ['sugar', 'milk', 'cream', 'vanilla-extract'], defaultShelfLifeDays: 2, healthScore: 0.55, macros: m(322, 15.9, 3.6, 27, 48) },
};

/** Shorthand for a UNIT_INFO entry: the unit this ingredient is normally bought/tracked in, and a typical single-serving amount in that unit. */
function u(unit: Unit, servingQty: number) {
  return { unit, servingQty };
}

/**
 * The unit each ingredient is normally bought/tracked in, and how much of it
 * a single serving typically uses. Kept as its own table (rather than inline
 * on each SEED entry) so every id is required to have one — Record<SeedId, ...>
 * fails `tsc` on a missing entry — without reformatting the SEED table above.
 * Heuristic sizing for the servings stepper and pantry-shortfall check, not a
 * precise culinary reference.
 */
const UNIT_INFO: Record<SeedId, { unit: Unit; servingQty: number }> = {
  // ---- Proteins ----
  'chicken-breast': u('piece', 1),
  'chicken-thigh': u('piece', 1),
  turkey: u('g', 150),
  'ground-beef': u('g', 150),
  'beef-steak': u('piece', 1),
  'pork-chop': u('piece', 1),
  bacon: u('g', 30),
  sausage: u('piece', 2),
  lamb: u('g', 150),
  duck: u('piece', 1),
  salmon: u('piece', 1),
  tuna: u('g', 150),
  shrimp: u('g', 150),
  cod: u('piece', 1),
  tilapia: u('piece', 1),
  mussels: u('g', 200),
  tofu: u('g', 150),
  tempeh: u('g', 150),
  eggs: u('piece', 2),
  chickpeas: u('g', 150),
  'black-beans': u('g', 150),
  'kidney-beans': u('g', 150),
  lentils: u('g', 150),
  'greek-yogurt': u('g', 100),

  // ---- Fats ----
  butter: u('g', 15),
  'olive-oil': u('ml', 15),
  'sesame-oil': u('ml', 5),
  'vegetable-oil': u('ml', 15),
  'coconut-oil': u('ml', 15),
  ghee: u('g', 15),
  avocado: u('piece', 0.5),
  tahini: u('g', 20),
  mayonnaise: u('g', 15),

  // ---- Acids ----
  lemon: u('piece', 0.5),
  lime: u('piece', 0.5),
  vinegar: u('ml', 15),
  'rice-vinegar': u('ml', 15),
  'balsamic-vinegar': u('ml', 15),
  'white-wine': u('ml', 60),
  tamarind: u('g', 15),

  // ---- Aromatics ----
  garlic: u('piece', 0.3),
  onion: u('piece', 0.5),
  shallot: u('piece', 0.5),
  ginger: u('g', 10),
  scallion: u('piece', 2),
  leek: u('piece', 0.5),
  celery: u('piece', 1),
  cilantro: u('g', 5),
  lemongrass: u('piece', 1),
  chili: u('piece', 1),

  // ---- Starches ----
  rice: u('g', 75),
  'brown-rice': u('g', 75),
  pasta: u('g', 85),
  potato: u('piece', 1),
  'sweet-potato': u('piece', 1),
  tortilla: u('piece', 2),
  bread: u('piece', 2),
  quinoa: u('g', 60),
  couscous: u('g', 60),
  'rice-noodles': u('g', 75),
  bulgur: u('g', 60),
  oats: u('g', 50),
  cornmeal: u('g', 50),

  // ---- Vegetables ----
  tomato: u('piece', 1),
  spinach: u('g', 60),
  kale: u('g', 50),
  'bell-pepper': u('piece', 0.5),
  broccoli: u('g', 80),
  cauliflower: u('g', 80),
  carrot: u('piece', 1),
  zucchini: u('piece', 0.5),
  eggplant: u('piece', 0.5),
  mushroom: u('g', 80),
  cabbage: u('g', 80),
  'brussels-sprouts': u('g', 80),
  asparagus: u('g', 80),
  'green-beans': u('g', 80),
  peas: u('g', 60),
  corn: u('piece', 0.5),
  cucumber: u('piece', 0.5),
  radish: u('piece', 2),
  beet: u('piece', 1),
  'butternut-squash': u('g', 100),
  pumpkin: u('g', 100),

  // ---- Dairy ----
  cheddar: u('g', 30),
  parmesan: u('g', 15),
  feta: u('g', 30),
  mozzarella: u('g', 40),
  cream: u('ml', 30),
  milk: u('ml', 100),
  'sour-cream': u('g', 20),

  // ---- Spices & herbs ----
  thyme: u('g', 1),
  dill: u('g', 3),
  basil: u('g', 3),
  cumin: u('g', 2),
  'chili-flakes': u('g', 1),
  paprika: u('g', 2),
  cinnamon: u('g', 2),
  turmeric: u('g', 2),
  'black-pepper': u('g', 1),
  oregano: u('g', 1),
  rosemary: u('g', 2),
  mint: u('g', 3),
  parsley: u('g', 3),
  'bay-leaf': u('piece', 1),
  'curry-powder': u('g', 3),
  'five-spice-powder': u('g', 2),
  cardamom: u('g', 1),
  nutmeg: u('g', 1),
  'coriander-seed': u('g', 2),
  sage: u('g', 2),

  // ---- Sweeteners ----
  sugar: u('g', 10),
  honey: u('g', 15),
  'maple-syrup': u('ml', 15),
  'brown-sugar': u('g', 10),

  // ---- Liquids & sauces ----
  'soy-sauce': u('ml', 15),
  'fish-sauce': u('ml', 10),
  'chicken-stock': u('ml', 200),
  'vegetable-stock': u('ml', 200),
  'coconut-milk': u('ml', 100),
  'red-wine': u('ml', 60),
  'hoisin-sauce': u('ml', 15),
  'oyster-sauce': u('ml', 10),
  sriracha: u('ml', 10),
  mustard: u('g', 10),
  ketchup: u('g', 15),
  'worcestershire-sauce': u('ml', 5),

  // ---- Nuts & seeds ----
  peanuts: u('g', 20),
  almonds: u('g', 20),
  cashews: u('g', 20),
  walnuts: u('g', 20),
  'sesame-seeds': u('g', 5),
  'pine-nuts': u('g', 15),

  // ---- Baking ----
  flour: u('g', 60),
  'baking-powder': u('g', 3),
  'baking-soda': u('g', 2),
  'vanilla-extract': u('ml', 3),

  // ---- Egg components ----
  'egg-white': u('piece', 2),
  'egg-yolk': u('piece', 2),
};

export const INGREDIENTS: IngredientDef[] = INGREDIENT_ID_LIST.map((id) => ({
  id,
  ...SEED[id],
  ...UNIT_INFO[id],
}));

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
