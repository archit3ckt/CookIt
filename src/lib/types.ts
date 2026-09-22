export type IngredientRole =
  | 'protein'
  | 'fat'
  | 'acid'
  | 'aromatic'
  | 'starch'
  | 'vegetable'
  | 'dairy'
  | 'spice'
  | 'sweetener'
  | 'liquid'
  | 'flour'
  | 'leavening'
  /** Eggs specifically, distinct from the generic 'protein' role — baking needs eggs, not just any protein. */
  | 'egg'
  /** Separated egg white/yolk — distinct from 'egg' since whole eggs aren't a substitute in a meringue or custard. */
  | 'egg-white'
  | 'egg-yolk';

/** Macronutrients per 100g of the ingredient as typically eaten (cooked meat/veg, dried spices as sold, etc). */
export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sodiumMg: number;
}

export interface IngredientDef {
  id: string;
  name: string;
  roles: IngredientRole[];
  /** Ids of ingredients this one pairs well with. */
  pairsWith: string[];
  /** Typical fridge/pantry shelf life in days, used to estimate expiry when none is scanned. */
  defaultShelfLifeDays: number;
  /** 0-1 simplified nutrition heuristic (whole/nutrient-dense vs. processed/empty-calorie). Not medical advice. */
  healthScore: number;
  /** Reference nutrition data, per 100g. Not a substitute for verified nutrition facts. */
  macros: Macros;
}

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'unknown';

export interface PantryItem {
  id: string;
  ingredientId: string;
  /** Free-text label as scanned/entered, kept for display even if ingredientId is a fuzzy match. */
  label: string;
  quantity: number;
  unit: Unit;
  expiresOn: string | null; // ISO date
  addedOn: string; // ISO date
  source: 'receipt' | 'barcode' | 'manual';
}

export type Technique =
  | 'saute'
  | 'roast'
  | 'braise'
  | 'stir-fry'
  | 'raw-salad'
  | 'simmer-soup'
  | 'grill'
  | 'bake'
  | 'steam'
  | 'poach'
  | 'deep-fry'
  | 'blend'
  | 'cake'
  | 'meringue'
  | 'custard';

export interface TechniqueTemplate {
  id: Technique;
  name: string;
  /** Roles the technique needs filled to produce a balanced dish. */
  requiredRoles: IngredientRole[];
  /** Roles that improve the dish but aren't mandatory. */
  optionalRoles: IngredientRole[];
  baseMinutes: number;
  minutesPerExtraIngredient: number;
  difficulty: 1 | 2 | 3;
  /** Multiplier applied to the averaged ingredient health score (e.g. deep-fry lowers it, steaming raises it). */
  healthModifier: number;
  steps: (ctx: TechniqueContext) => string[];
}

export interface TechniqueContext {
  protein?: string;
  /** Grams of fat per 100g of the chosen protein — lets steps() adjust added-oil advice to how fatty the cut already is. */
  proteinFatG?: number;
  fat?: string;
  acid?: string;
  aromatics: string[];
  starch?: string;
  vegetables: string[];
  dairy?: string;
  spices: string[];
  sweetener?: string;
  flour?: string;
  leavening?: string;
  egg?: string;
  eggWhite?: string;
  eggYolk?: string;
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  technique: Technique;
  ingredientIds: string[];
  steps: string[];
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3;
  /** 0-1, how much of the pairing/balance rules this combo satisfies. */
  balanceScore: number;
  /** 0-1, higher = uses more soon-to-expire pantry items. */
  wasteScore: number;
  /** 0-1 simplified nutrition heuristic for the whole dish (ingredient healthScores x technique modifier). */
  healthScore: number;
  /** Average per-100g macros across the chosen ingredients — a relative comparison figure, not a true per-serving total. */
  macros: Macros;
  /** Id of a companion recipe that uses the leftover half of a split ingredient this one only partially uses (e.g. egg yolks left over from a whites-only meringue). */
  pairedRecipeId?: string;
  /** Human-readable reason for the pairing, e.g. "uses the leftover egg yolks." */
  pairedRecipeNote?: string;
}

export type RecipeSort = 'waste' | 'time' | 'ease' | 'health' | 'protein';
