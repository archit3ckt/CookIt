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
  | 'liquid';

export interface IngredientDef {
  id: string;
  name: string;
  roles: IngredientRole[];
  /** Ids of ingredients this one pairs well with. */
  pairsWith: string[];
  /** Typical fridge/pantry shelf life in days, used to estimate expiry when none is scanned. */
  defaultShelfLifeDays: number;
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
  | 'grill';

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
  steps: (ctx: TechniqueContext) => string[];
}

export interface TechniqueContext {
  protein?: string;
  fat?: string;
  acid?: string;
  aromatics: string[];
  starch?: string;
  vegetables: string[];
  dairy?: string;
  spices: string[];
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
}

export type RecipeSort = 'waste' | 'time' | 'ease';
