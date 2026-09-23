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

/**
 * A physical thing an ingredient can be made to do, independent of its
 * culinary `role`. Orthogonal on purpose: a technique slot narrows by role +
 * action together (e.g. 'starch' + 'wrappable') instead of every new
 * role/action combination needing its own bespoke role name — a "whiskable
 * fat" or "wrappable vegetable" reuses these same actions rather than
 * minting 'whiskable-fat' / 'wrappable-vegetable'. Most ingredients perform
 * none of these and have an empty actions list.
 */
export type IngredientAction =
  | 'whiskable' // can be poured/whisked raw into a dressing, or whipped into a foam
  | 'wrappable' // can be warmed and rolled/folded around a filling
  | 'kneadable' // becomes a dough when hydrated
  | 'ready-to-eat' // safe to eat as-is, no cooking step needed first
  | 'heatable' // can serve as the direct heating medium in a pan or pot (sauté, deep-fry)
  | 'creamable'; // a solid fat that can be beaten with sugar to trap air (baking's "creaming" step)

/**
 * A technique slot's requirement: a role on its own, or a role narrowed to
 * ingredients that can also perform a given action. Plain strings cover the
 * common case so most technique definitions don't need to change shape.
 */
export interface RoleRequirement {
  role: IngredientRole;
  action?: IngredientAction;
}
export type RoleSlot = IngredientRole | RoleRequirement;

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
  /** The unit this ingredient is normally bought/tracked in — grams for most, ml for liquids, a plain count for whole produce/eggs. */
  unit: Unit;
  /** Typical amount used in one serving of a dish, in `unit`. */
  servingQty: number;
  /** Physical actions this ingredient can perform — see IngredientAction. Empty for most ingredients. */
  actions: IngredientAction[];
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
  | 'kubbeh'
  | 'shawarma';

/**
 * One part of a composite dish (a dumpling shell, its filling, the broth it
 * simmers in) — filled the same way a flat technique's roles are, just
 * scoped to this part rather than the whole dish.
 */
export interface TechniqueComponent {
  id: string;
  label: string;
  requiredRoles: RoleSlot[];
  optionalRoles: RoleSlot[];
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
  requiredRoles: RoleSlot[];
  /** Roles that improve the dish but aren't mandatory. */
  optionalRoles: RoleSlot[];
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

/** One chosen ingredient's typical amount for a single serving of the dish. */
export interface RecipeIngredientQty {
  ingredientId: string;
  role: IngredientRole;
  /** Typical quantity for one serving, in `unit` — a sizing heuristic for scaling by servings and flagging pantry shortfalls, not a precise culinary measurement. */
  perServingQty: number;
  unit: Unit;
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  technique: Technique;
  ingredientIds: string[];
  /** Per-ingredient serving-scalable quantities, parallel to ingredientIds. */
  ingredients: RecipeIngredientQty[];
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

/** A snapshot of a GeneratedRecipe taken at the moment the user marked it as made — recipes are derived from the pantry, not stored, so a snapshot is the only way a log entry survives the pantry changing later. */
export interface MadeRecipe {
  id: string;
  recipeId: string;
  title: string;
  technique: Technique;
  ingredientIds: string[];
  steps: string[];
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3;
  healthScore: number;
  macros: Macros;
  madeOn: string; // ISO date
  liked: boolean;
}
