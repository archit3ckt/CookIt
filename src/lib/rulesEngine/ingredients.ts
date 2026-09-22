import { IngredientDef } from '../types';

/**
 * Seed ingredient knowledge base: roles, a hand-curated flavor-pairing graph
 * (classic pairings / shared-cuisine convention), and a simplified 0-1
 * healthScore heuristic (whole & nutrient-dense vs. processed/empty-calorie
 * — not a nutrition-facts substitute). This is the "chef's heuristics" data
 * the generator combines at runtime; it is not a recipe database.
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
] as const;

type SeedId = (typeof INGREDIENT_ID_LIST)[number];
type SeedEntry = Omit<IngredientDef, 'id' | 'pairsWith'> & { pairsWith: SeedId[] };

const SEED: Record<SeedId, SeedEntry> = {
  // ---- Proteins ----
  'chicken-breast': { name: 'Chicken breast', roles: ['protein'], pairsWith: ['garlic', 'lemon', 'onion', 'butter', 'thyme', 'olive-oil'], defaultShelfLifeDays: 2, healthScore: 0.8 },
  'chicken-thigh': { name: 'Chicken thigh', roles: ['protein'], pairsWith: ['garlic', 'ginger', 'soy-sauce', 'paprika', 'onion'], defaultShelfLifeDays: 2, healthScore: 0.65 },
  turkey: { name: 'Turkey', roles: ['protein'], pairsWith: ['sage', 'thyme', 'garlic', 'onion'], defaultShelfLifeDays: 2, healthScore: 0.8 },
  'ground-beef': { name: 'Ground beef', roles: ['protein'], pairsWith: ['onion', 'garlic', 'tomato', 'cumin', 'chili-flakes'], defaultShelfLifeDays: 2, healthScore: 0.45 },
  'beef-steak': { name: 'Beef steak', roles: ['protein'], pairsWith: ['garlic', 'butter', 'rosemary', 'black-pepper'], defaultShelfLifeDays: 3, healthScore: 0.5 },
  'pork-chop': { name: 'Pork chop', roles: ['protein'], pairsWith: ['garlic', 'sage', 'thyme', 'mustard'], defaultShelfLifeDays: 3, healthScore: 0.55 },
  bacon: { name: 'Bacon', roles: ['protein', 'fat'], pairsWith: ['eggs', 'potato', 'black-pepper', 'maple-syrup'], defaultShelfLifeDays: 7, healthScore: 0.25 },
  sausage: { name: 'Sausage', roles: ['protein'], pairsWith: ['onion', 'bell-pepper', 'mustard', 'cabbage'], defaultShelfLifeDays: 5, healthScore: 0.3 },
  lamb: { name: 'Lamb', roles: ['protein'], pairsWith: ['garlic', 'rosemary', 'lemon', 'cumin'], defaultShelfLifeDays: 3, healthScore: 0.5 },
  duck: { name: 'Duck', roles: ['protein'], pairsWith: ['five-spice-powder', 'ginger', 'scallion', 'hoisin-sauce'], defaultShelfLifeDays: 2, healthScore: 0.45 },
  salmon: { name: 'Salmon', roles: ['protein', 'fat'], pairsWith: ['lemon', 'dill', 'butter', 'garlic', 'soy-sauce'], defaultShelfLifeDays: 2, healthScore: 0.85 },
  tuna: { name: 'Tuna', roles: ['protein'], pairsWith: ['soy-sauce', 'sesame-oil', 'lime', 'ginger'], defaultShelfLifeDays: 2, healthScore: 0.8 },
  shrimp: { name: 'Shrimp', roles: ['protein'], pairsWith: ['garlic', 'lemon', 'chili', 'butter', 'cilantro'], defaultShelfLifeDays: 2, healthScore: 0.75 },
  cod: { name: 'Cod', roles: ['protein'], pairsWith: ['lemon', 'butter', 'parsley', 'garlic'], defaultShelfLifeDays: 2, healthScore: 0.85 },
  tilapia: { name: 'Tilapia', roles: ['protein'], pairsWith: ['lime', 'cumin', 'cilantro', 'chili'], defaultShelfLifeDays: 2, healthScore: 0.7 },
  mussels: { name: 'Mussels', roles: ['protein'], pairsWith: ['garlic', 'white-wine', 'parsley', 'butter'], defaultShelfLifeDays: 2, healthScore: 0.75 },
  tofu: { name: 'Tofu', roles: ['protein'], pairsWith: ['soy-sauce', 'ginger', 'garlic', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 7, healthScore: 0.8 },
  tempeh: { name: 'Tempeh', roles: ['protein'], pairsWith: ['soy-sauce', 'ginger', 'garlic', 'lime'], defaultShelfLifeDays: 10, healthScore: 0.85 },
  eggs: { name: 'Eggs', roles: ['protein', 'fat'], pairsWith: ['butter', 'cheddar', 'spinach', 'onion', 'tomato'], defaultShelfLifeDays: 21, healthScore: 0.75 },
  chickpeas: { name: 'Chickpeas', roles: ['protein', 'starch'], pairsWith: ['cumin', 'garlic', 'lemon', 'olive-oil', 'onion'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  'black-beans': { name: 'Black beans', roles: ['protein', 'starch'], pairsWith: ['cumin', 'lime', 'cilantro', 'chili'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  'kidney-beans': { name: 'Kidney beans', roles: ['protein', 'starch'], pairsWith: ['cumin', 'tomato', 'onion', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  lentils: { name: 'Lentils', roles: ['protein', 'starch'], pairsWith: ['cumin', 'turmeric', 'garlic', 'onion', 'vegetable-stock'], defaultShelfLifeDays: 365, healthScore: 0.9 },
  'greek-yogurt': { name: 'Greek yogurt', roles: ['protein', 'dairy'], pairsWith: ['cucumber', 'mint', 'lemon', 'dill', 'honey'], defaultShelfLifeDays: 14, healthScore: 0.75 },

  // ---- Fats ----
  butter: { name: 'Butter', roles: ['fat', 'dairy'], pairsWith: ['garlic', 'thyme', 'lemon', 'onion'], defaultShelfLifeDays: 60, healthScore: 0.35 },
  'olive-oil': { name: 'Olive oil', roles: ['fat'], pairsWith: ['garlic', 'lemon', 'tomato', 'basil'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  'sesame-oil': { name: 'Sesame oil', roles: ['fat'], pairsWith: ['soy-sauce', 'ginger', 'scallion', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.7 },
  'vegetable-oil': { name: 'Vegetable oil', roles: ['fat'], pairsWith: ['garlic', 'onion', 'chili'], defaultShelfLifeDays: 365, healthScore: 0.45 },
  'coconut-oil': { name: 'Coconut oil', roles: ['fat'], pairsWith: ['curry-powder', 'ginger', 'lime'], defaultShelfLifeDays: 365, healthScore: 0.4 },
  ghee: { name: 'Ghee', roles: ['fat'], pairsWith: ['cumin', 'turmeric', 'garlic', 'onion'], defaultShelfLifeDays: 180, healthScore: 0.4 },
  avocado: { name: 'Avocado', roles: ['fat', 'vegetable'], pairsWith: ['lime', 'cilantro', 'tomato', 'chili'], defaultShelfLifeDays: 5, healthScore: 0.85 },
  tahini: { name: 'Tahini', roles: ['fat'], pairsWith: ['lemon', 'garlic', 'chickpeas', 'cumin'], defaultShelfLifeDays: 90, healthScore: 0.75 },
  mayonnaise: { name: 'Mayonnaise', roles: ['fat'], pairsWith: ['lemon', 'mustard', 'garlic'], defaultShelfLifeDays: 60, healthScore: 0.3 },

  // ---- Acids ----
  lemon: { name: 'Lemon', roles: ['acid'], pairsWith: ['garlic', 'butter', 'olive-oil', 'thyme', 'dill'], defaultShelfLifeDays: 21, healthScore: 0.9 },
  lime: { name: 'Lime', roles: ['acid'], pairsWith: ['cilantro', 'chili', 'garlic'], defaultShelfLifeDays: 21, healthScore: 0.9 },
  vinegar: { name: 'Vinegar', roles: ['acid'], pairsWith: ['olive-oil', 'onion', 'garlic'], defaultShelfLifeDays: 730, healthScore: 0.7 },
  'rice-vinegar': { name: 'Rice vinegar', roles: ['acid'], pairsWith: ['soy-sauce', 'sesame-oil', 'ginger'], defaultShelfLifeDays: 730, healthScore: 0.65 },
  'balsamic-vinegar': { name: 'Balsamic vinegar', roles: ['acid'], pairsWith: ['olive-oil', 'tomato', 'basil'], defaultShelfLifeDays: 730, healthScore: 0.6 },
  'white-wine': { name: 'White wine', roles: ['acid', 'liquid'], pairsWith: ['garlic', 'butter', 'mussels', 'cream'], defaultShelfLifeDays: 5, healthScore: 0.4 },
  tamarind: { name: 'Tamarind', roles: ['acid'], pairsWith: ['chili', 'garlic', 'cumin'], defaultShelfLifeDays: 180, healthScore: 0.7 },

  // ---- Aromatics ----
  garlic: { name: 'Garlic', roles: ['aromatic'], pairsWith: ['onion', 'olive-oil', 'butter', 'ginger'], defaultShelfLifeDays: 90, healthScore: 0.9 },
  onion: { name: 'Onion', roles: ['aromatic'], pairsWith: ['garlic', 'butter', 'olive-oil'], defaultShelfLifeDays: 30, healthScore: 0.85 },
  shallot: { name: 'Shallot', roles: ['aromatic'], pairsWith: ['garlic', 'butter', 'white-wine'], defaultShelfLifeDays: 30, healthScore: 0.85 },
  ginger: { name: 'Ginger', roles: ['aromatic'], pairsWith: ['garlic', 'soy-sauce', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 21, healthScore: 0.9 },
  scallion: { name: 'Scallion', roles: ['aromatic'], pairsWith: ['ginger', 'soy-sauce', 'sesame-oil'], defaultShelfLifeDays: 10, healthScore: 0.85 },
  leek: { name: 'Leek', roles: ['aromatic', 'vegetable'], pairsWith: ['butter', 'potato', 'chicken-stock'], defaultShelfLifeDays: 14, healthScore: 0.85 },
  celery: { name: 'Celery', roles: ['aromatic', 'vegetable'], pairsWith: ['carrot', 'onion', 'chicken-stock'], defaultShelfLifeDays: 14, healthScore: 0.9 },
  cilantro: { name: 'Cilantro', roles: ['aromatic'], pairsWith: ['lime', 'chili', 'garlic'], defaultShelfLifeDays: 7, healthScore: 0.9 },
  lemongrass: { name: 'Lemongrass', roles: ['aromatic'], pairsWith: ['ginger', 'lime', 'coconut-milk', 'chili'], defaultShelfLifeDays: 14, healthScore: 0.85 },
  chili: { name: 'Chili pepper', roles: ['aromatic', 'vegetable'], pairsWith: ['garlic', 'lime', 'ginger', 'cilantro'], defaultShelfLifeDays: 14, healthScore: 0.85 },

  // ---- Starches ----
  rice: { name: 'Rice', roles: ['starch'], pairsWith: ['soy-sauce', 'sesame-oil', 'ginger', 'scallion'], defaultShelfLifeDays: 365, healthScore: 0.55 },
  'brown-rice': { name: 'Brown rice', roles: ['starch'], pairsWith: ['soy-sauce', 'ginger', 'vegetable-stock'], defaultShelfLifeDays: 365, healthScore: 0.75 },
  pasta: { name: 'Pasta', roles: ['starch'], pairsWith: ['tomato', 'basil', 'garlic', 'olive-oil'], defaultShelfLifeDays: 365, healthScore: 0.5 },
  potato: { name: 'Potato', roles: ['starch', 'vegetable'], pairsWith: ['butter', 'garlic', 'thyme'], defaultShelfLifeDays: 30, healthScore: 0.6 },
  'sweet-potato': { name: 'Sweet potato', roles: ['starch', 'vegetable'], pairsWith: ['cinnamon', 'butter', 'olive-oil', 'cumin'], defaultShelfLifeDays: 21, healthScore: 0.8 },
  tortilla: { name: 'Tortilla', roles: ['starch'], pairsWith: ['cumin', 'chili', 'cilantro', 'lime'], defaultShelfLifeDays: 14, healthScore: 0.5 },
  bread: { name: 'Bread', roles: ['starch'], pairsWith: ['butter', 'cheddar', 'olive-oil'], defaultShelfLifeDays: 7, healthScore: 0.45 },
  quinoa: { name: 'Quinoa', roles: ['starch'], pairsWith: ['lemon', 'olive-oil', 'vegetable-stock', 'parsley'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  couscous: { name: 'Couscous', roles: ['starch'], pairsWith: ['lemon', 'olive-oil', 'parsley', 'vegetable-stock'], defaultShelfLifeDays: 365, healthScore: 0.55 },
  'rice-noodles': { name: 'Rice noodles', roles: ['starch'], pairsWith: ['soy-sauce', 'lime', 'fish-sauce', 'cilantro'], defaultShelfLifeDays: 365, healthScore: 0.5 },
  bulgur: { name: 'Bulgur', roles: ['starch'], pairsWith: ['lemon', 'parsley', 'olive-oil', 'tomato'], defaultShelfLifeDays: 365, healthScore: 0.75 },
  oats: { name: 'Oats', roles: ['starch'], pairsWith: ['milk', 'honey', 'cinnamon'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  cornmeal: { name: 'Cornmeal', roles: ['starch'], pairsWith: ['butter', 'cheddar', 'chicken-stock'], defaultShelfLifeDays: 365, healthScore: 0.55 },

  // ---- Vegetables ----
  tomato: { name: 'Tomato', roles: ['acid', 'vegetable'], pairsWith: ['basil', 'garlic', 'olive-oil', 'onion'], defaultShelfLifeDays: 5, healthScore: 0.85 },
  spinach: { name: 'Spinach', roles: ['vegetable'], pairsWith: ['garlic', 'butter', 'eggs', 'lemon'], defaultShelfLifeDays: 5, healthScore: 0.95 },
  kale: { name: 'Kale', roles: ['vegetable'], pairsWith: ['garlic', 'lemon', 'olive-oil', 'chili-flakes'], defaultShelfLifeDays: 7, healthScore: 0.95 },
  'bell-pepper': { name: 'Bell pepper', roles: ['vegetable'], pairsWith: ['onion', 'garlic', 'soy-sauce'], defaultShelfLifeDays: 10, healthScore: 0.9 },
  broccoli: { name: 'Broccoli', roles: ['vegetable'], pairsWith: ['garlic', 'soy-sauce', 'sesame-oil'], defaultShelfLifeDays: 7, healthScore: 0.95 },
  cauliflower: { name: 'Cauliflower', roles: ['vegetable'], pairsWith: ['garlic', 'cumin', 'turmeric', 'olive-oil'], defaultShelfLifeDays: 7, healthScore: 0.9 },
  carrot: { name: 'Carrot', roles: ['vegetable'], pairsWith: ['ginger', 'butter', 'onion'], defaultShelfLifeDays: 21, healthScore: 0.85 },
  zucchini: { name: 'Zucchini', roles: ['vegetable'], pairsWith: ['garlic', 'olive-oil', 'basil'], defaultShelfLifeDays: 7, healthScore: 0.85 },
  eggplant: { name: 'Eggplant', roles: ['vegetable'], pairsWith: ['garlic', 'olive-oil', 'tomato', 'basil'], defaultShelfLifeDays: 7, healthScore: 0.8 },
  mushroom: { name: 'Mushroom', roles: ['vegetable'], pairsWith: ['garlic', 'butter', 'thyme', 'white-wine'], defaultShelfLifeDays: 7, healthScore: 0.8 },
  cabbage: { name: 'Cabbage', roles: ['vegetable'], pairsWith: ['vinegar', 'carrot', 'soy-sauce'], defaultShelfLifeDays: 21, healthScore: 0.85 },
  'brussels-sprouts': { name: 'Brussels sprouts', roles: ['vegetable'], pairsWith: ['bacon', 'garlic', 'balsamic-vinegar'], defaultShelfLifeDays: 10, healthScore: 0.9 },
  asparagus: { name: 'Asparagus', roles: ['vegetable'], pairsWith: ['lemon', 'garlic', 'olive-oil', 'parmesan'], defaultShelfLifeDays: 5, healthScore: 0.9 },
  'green-beans': { name: 'Green beans', roles: ['vegetable'], pairsWith: ['garlic', 'almonds', 'butter'], defaultShelfLifeDays: 7, healthScore: 0.85 },
  peas: { name: 'Peas', roles: ['vegetable'], pairsWith: ['mint', 'butter', 'garlic'], defaultShelfLifeDays: 7, healthScore: 0.8 },
  corn: { name: 'Corn', roles: ['vegetable', 'starch'], pairsWith: ['butter', 'lime', 'chili'], defaultShelfLifeDays: 7, healthScore: 0.65 },
  cucumber: { name: 'Cucumber', roles: ['vegetable'], pairsWith: ['greek-yogurt', 'mint', 'dill', 'lemon'], defaultShelfLifeDays: 7, healthScore: 0.85 },
  radish: { name: 'Radish', roles: ['vegetable'], pairsWith: ['lime', 'cilantro', 'butter'], defaultShelfLifeDays: 14, healthScore: 0.85 },
  beet: { name: 'Beet', roles: ['vegetable'], pairsWith: ['feta', 'olive-oil', 'balsamic-vinegar'], defaultShelfLifeDays: 21, healthScore: 0.8 },
  'butternut-squash': { name: 'Butternut squash', roles: ['vegetable'], pairsWith: ['cinnamon', 'butter', 'sage'], defaultShelfLifeDays: 30, healthScore: 0.8 },
  pumpkin: { name: 'Pumpkin', roles: ['vegetable'], pairsWith: ['cinnamon', 'nutmeg', 'butter'], defaultShelfLifeDays: 30, healthScore: 0.8 },

  // ---- Dairy ----
  cheddar: { name: 'Cheddar', roles: ['dairy'], pairsWith: ['eggs', 'potato', 'bread'], defaultShelfLifeDays: 30, healthScore: 0.45 },
  parmesan: { name: 'Parmesan', roles: ['dairy'], pairsWith: ['pasta', 'tomato', 'basil', 'asparagus'], defaultShelfLifeDays: 60, healthScore: 0.5 },
  feta: { name: 'Feta', roles: ['dairy'], pairsWith: ['beet', 'cucumber', 'olive-oil', 'mint'], defaultShelfLifeDays: 30, healthScore: 0.5 },
  mozzarella: { name: 'Mozzarella', roles: ['dairy'], pairsWith: ['tomato', 'basil', 'olive-oil'], defaultShelfLifeDays: 14, healthScore: 0.5 },
  cream: { name: 'Cream', roles: ['dairy', 'fat'], pairsWith: ['garlic', 'onion', 'butter', 'mushroom'], defaultShelfLifeDays: 10, healthScore: 0.3 },
  milk: { name: 'Milk', roles: ['dairy', 'liquid'], pairsWith: ['oats', 'honey', 'cinnamon'], defaultShelfLifeDays: 7, healthScore: 0.6 },
  'sour-cream': { name: 'Sour cream', roles: ['dairy'], pairsWith: ['potato', 'scallion', 'lime'], defaultShelfLifeDays: 21, healthScore: 0.35 },

  // ---- Spices & herbs ----
  thyme: { name: 'Thyme', roles: ['spice'], pairsWith: ['chicken-breast', 'butter', 'garlic', 'potato'], defaultShelfLifeDays: 14, healthScore: 0.9 },
  dill: { name: 'Dill', roles: ['spice'], pairsWith: ['salmon', 'lemon', 'cream', 'cucumber'], defaultShelfLifeDays: 10, healthScore: 0.9 },
  basil: { name: 'Basil', roles: ['spice'], pairsWith: ['tomato', 'olive-oil', 'pasta'], defaultShelfLifeDays: 7, healthScore: 0.9 },
  cumin: { name: 'Cumin', roles: ['spice'], pairsWith: ['chickpeas', 'ground-beef', 'onion', 'chili-flakes'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  'chili-flakes': { name: 'Chili flakes', roles: ['spice'], pairsWith: ['garlic', 'lime', 'ginger'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  paprika: { name: 'Paprika', roles: ['spice'], pairsWith: ['chicken-thigh', 'potato', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  cinnamon: { name: 'Cinnamon', roles: ['spice'], pairsWith: ['sweet-potato', 'oats', 'honey'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  turmeric: { name: 'Turmeric', roles: ['spice'], pairsWith: ['ginger', 'garlic', 'coconut-milk', 'cauliflower'], defaultShelfLifeDays: 365, healthScore: 0.9 },
  'black-pepper': { name: 'Black pepper', roles: ['spice'], pairsWith: ['beef-steak', 'garlic', 'butter'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  oregano: { name: 'Oregano', roles: ['spice'], pairsWith: ['tomato', 'olive-oil', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.9 },
  rosemary: { name: 'Rosemary', roles: ['spice'], pairsWith: ['beef-steak', 'lamb', 'garlic', 'olive-oil'], defaultShelfLifeDays: 14, healthScore: 0.9 },
  mint: { name: 'Mint', roles: ['spice'], pairsWith: ['peas', 'cucumber', 'lamb', 'greek-yogurt'], defaultShelfLifeDays: 10, healthScore: 0.9 },
  parsley: { name: 'Parsley', roles: ['spice'], pairsWith: ['lemon', 'garlic', 'olive-oil'], defaultShelfLifeDays: 10, healthScore: 0.9 },
  'bay-leaf': { name: 'Bay leaf', roles: ['spice'], pairsWith: ['chicken-stock', 'onion', 'garlic'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  'curry-powder': { name: 'Curry powder', roles: ['spice'], pairsWith: ['coconut-milk', 'ginger', 'garlic', 'chickpeas'], defaultShelfLifeDays: 365, healthScore: 0.8 },
  'five-spice-powder': { name: 'Five-spice powder', roles: ['spice'], pairsWith: ['duck', 'soy-sauce', 'ginger'], defaultShelfLifeDays: 365, healthScore: 0.8 },
  cardamom: { name: 'Cardamom', roles: ['spice'], pairsWith: ['cinnamon', 'rice', 'milk'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  nutmeg: { name: 'Nutmeg', roles: ['spice'], pairsWith: ['pumpkin', 'cream', 'spinach'], defaultShelfLifeDays: 365, healthScore: 0.8 },
  'coriander-seed': { name: 'Coriander seed', roles: ['spice'], pairsWith: ['cumin', 'lime', 'chicken-thigh'], defaultShelfLifeDays: 365, healthScore: 0.85 },
  sage: { name: 'Sage', roles: ['spice'], pairsWith: ['turkey', 'pork-chop', 'butternut-squash', 'butter'], defaultShelfLifeDays: 10, healthScore: 0.9 },

  // ---- Sweeteners ----
  sugar: { name: 'Sugar', roles: ['sweetener'], pairsWith: ['cinnamon', 'butter'], defaultShelfLifeDays: 730, healthScore: 0.15 },
  honey: { name: 'Honey', roles: ['sweetener'], pairsWith: ['greek-yogurt', 'lemon', 'mustard'], defaultShelfLifeDays: 730, healthScore: 0.35 },
  'maple-syrup': { name: 'Maple syrup', roles: ['sweetener'], pairsWith: ['bacon', 'oats', 'cinnamon'], defaultShelfLifeDays: 365, healthScore: 0.35 },
  'brown-sugar': { name: 'Brown sugar', roles: ['sweetener'], pairsWith: ['cinnamon', 'ginger'], defaultShelfLifeDays: 730, healthScore: 0.15 },

  // ---- Liquids & sauces ----
  'soy-sauce': { name: 'Soy sauce', roles: ['spice', 'liquid'], pairsWith: ['ginger', 'garlic', 'sesame-oil', 'scallion'], defaultShelfLifeDays: 730, healthScore: 0.45 },
  'fish-sauce': { name: 'Fish sauce', roles: ['spice', 'liquid'], pairsWith: ['lime', 'chili', 'garlic', 'lemongrass'], defaultShelfLifeDays: 730, healthScore: 0.45 },
  'chicken-stock': { name: 'Chicken stock', roles: ['liquid'], pairsWith: ['celery', 'carrot', 'onion', 'bay-leaf'], defaultShelfLifeDays: 5, healthScore: 0.65 },
  'vegetable-stock': { name: 'Vegetable stock', roles: ['liquid'], pairsWith: ['celery', 'carrot', 'onion', 'lentils'], defaultShelfLifeDays: 5, healthScore: 0.75 },
  'coconut-milk': { name: 'Coconut milk', roles: ['liquid', 'fat'], pairsWith: ['curry-powder', 'ginger', 'lemongrass', 'lime'], defaultShelfLifeDays: 5, healthScore: 0.5 },
  'red-wine': { name: 'Red wine', roles: ['liquid', 'acid'], pairsWith: ['beef-steak', 'garlic', 'rosemary'], defaultShelfLifeDays: 5, healthScore: 0.4 },
  'hoisin-sauce': { name: 'Hoisin sauce', roles: ['spice'], pairsWith: ['duck', 'scallion', 'five-spice-powder'], defaultShelfLifeDays: 180, healthScore: 0.3 },
  'oyster-sauce': { name: 'Oyster sauce', roles: ['spice'], pairsWith: ['broccoli', 'garlic', 'ginger'], defaultShelfLifeDays: 180, healthScore: 0.35 },
  sriracha: { name: 'Sriracha', roles: ['spice'], pairsWith: ['eggs', 'garlic', 'lime'], defaultShelfLifeDays: 365, healthScore: 0.55 },
  mustard: { name: 'Mustard', roles: ['spice'], pairsWith: ['pork-chop', 'honey', 'mayonnaise'], defaultShelfLifeDays: 365, healthScore: 0.7 },
  ketchup: { name: 'Ketchup', roles: ['spice'], pairsWith: ['ground-beef', 'potato'], defaultShelfLifeDays: 365, healthScore: 0.3 },
  'worcestershire-sauce': { name: 'Worcestershire sauce', roles: ['spice'], pairsWith: ['beef-steak', 'ground-beef', 'mushroom'], defaultShelfLifeDays: 730, healthScore: 0.4 },

  // ---- Nuts & seeds ----
  peanuts: { name: 'Peanuts', roles: ['fat', 'protein'], pairsWith: ['soy-sauce', 'lime', 'chili', 'cilantro'], defaultShelfLifeDays: 180, healthScore: 0.75 },
  almonds: { name: 'Almonds', roles: ['fat'], pairsWith: ['green-beans', 'honey', 'cinnamon'], defaultShelfLifeDays: 180, healthScore: 0.85 },
  cashews: { name: 'Cashews', roles: ['fat', 'protein'], pairsWith: ['soy-sauce', 'ginger', 'scallion'], defaultShelfLifeDays: 180, healthScore: 0.75 },
  walnuts: { name: 'Walnuts', roles: ['fat'], pairsWith: ['beet', 'honey', 'feta'], defaultShelfLifeDays: 180, healthScore: 0.85 },
  'sesame-seeds': { name: 'Sesame seeds', roles: ['fat'], pairsWith: ['sesame-oil', 'soy-sauce', 'broccoli'], defaultShelfLifeDays: 365, healthScore: 0.8 },
  'pine-nuts': { name: 'Pine nuts', roles: ['fat'], pairsWith: ['basil', 'parmesan', 'olive-oil'], defaultShelfLifeDays: 180, healthScore: 0.8 },
};

export const INGREDIENTS: IngredientDef[] = INGREDIENT_ID_LIST.map((id) => ({ id, ...SEED[id] }));

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
