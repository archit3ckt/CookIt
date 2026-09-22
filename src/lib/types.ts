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
  | 'custard'
  | 'kubbeh';

/**
 * One part of a composite dish (a dumpling shell, its filling, the broth it
 * simmers in) — filled the same way a flat technique's roles are, just
 * scoped to this part rather than the whole dish.
 */
export interface TechniqueComponent {
  id: string;
  label: string;
  requiredRoles: IngredientRole[];
  optionalRoles: IngredientRole[];
}

interface TechniqueTemplateBase {
  id: Technique;
  name: string;
  baseMinutes: number;
  minutesPerExtraIngredient: number;
  difficulty: 1 | 2 | 3;
  /** Multiplier applied to the averaged ingredient health score (e.g. deep-fry lowers it, steaming raises it). */
  healthModifier: number;
}

/** A single-shot dish: one flat set of roles filled from the pantry, one linear set of steps. */
export interface FlatTechniqueTemplate extends TechniqueTemplateBase {
  kind: 'flat';
  /** Roles the technique needs filled to produce a balanced dish. */
  requiredRoles: IngredientRole[];
  /** Roles that improve the dish but aren't mandatory. */
  optionalRoles: IngredientRole[];
  steps: (ctx: TechniqueContext) => string[];
}

/**
 * A dish assembled from multiple independently-filled parts — a dumpling's
 * shell and filling, a pie's crust and filling, a sandwich's bread and its
 * contents. Each component fills its own roles from the pantry (sharing one
 * exclusion set with every other component, so the same physical ingredient
 * can't become both the shell's starch and the filling's), then `assemble`
 * describes how the finished parts come together.
 */
export interface CompositeTechniqueTemplate extends TechniqueTemplateBase {
  kind: 'composite';
  components: TechniqueComponent[];
  assemble: (componentContexts: Record<string, TechniqueContext>) => string[];
}

export type TechniqueTemplate = FlatTechniqueTemplate | CompositeTechniqueTemplate;

export interface TechniqueContext {
  protein?: string;
  /** Grams of fat per 100g of the chosen protein — lets steps() adjust added-oil advice to how fatty the cut already is. */
  proteinFatG?: number;
  fat?: string;
  acid?: string;
  liquid?: string;
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
