import { GeneratedRecipe, IngredientDef, IngredientRole, Macros, PantryItem, TechniqueContext, TechniqueTemplate } from '../types';
import { deriveVirtualPantryItems, pairByproductRecipes } from './byproducts';
import { FLAVOR_COMPOUND_IDS } from './flavorCompounds';
import { INGREDIENTS_BY_ID } from './ingredients';
import { TECHNIQUES } from './techniques';

const MULTI_ROLES: IngredientRole[] = ['aromatic', 'vegetable', 'spice'];
const MULTI_ROLE_LIMIT = 3;

interface PantryIngredient {
  item: PantryItem;
  def: IngredientDef;
  daysUntilExpiry: number;
}

// Below this many *shared* compounds, "connected" stops meaning anything. Verified empirically:
// requiring just 1 shared compound makes 66% of all matched-ingredient pairs "connect" (almost
// everything shares *something* — the well-known flaw in naive food-pairing-hypothesis
// implementations), which would make balanceScore stop discriminating good combos from bad ones.
// Normalizing by set size (Jaccard/overlap-coefficient) doesn't fix this either — it's dominated
// by small-set artifacts (chicken breast vs. chicken thigh scores 1.00; flour vs. pasta scores 1.00
// off just 4 shared compounds because flour's tiny cataloged set is a near-subset of pasta's).
// A plain shared-compound *count* threshold is the more defensible signal here: 5 is calibrated to
// clear every classic pairing spot-checked while building this (garlic/onion=16, salmon/dill=11,
// cilantro/lime=9, mint/lamb=6 — the floor), while roughly halving density vs. the naive rule.
const MIN_SHARED_COMPOUNDS = 5;

function sharedCompoundCount(aId: string, bId: string): number {
  const a = FLAVOR_COMPOUND_IDS[aId];
  const b = FLAVOR_COMPOUND_IDS[bId];
  if (!a || !b) return 0;
  const bSet = new Set(b);
  return a.reduce((n, c) => n + (bSet.has(c) ? 1 : 0), 0);
}

/**
 * Two ingredients are "paired" if either is true:
 * - they share at least MIN_SHARED_COMPOUNDS real detected aroma compounds
 *   (chemistry-sourced, see flavorCompounds.ts) — the actual food-pairing
 *   hypothesis, not a guess.
 * - one's hand-curated `pairsWith` lists the other — the fallback for the
 *   ~20% of ingredients the chemistry dataset doesn't cover.
 */
function pairingScore(a: IngredientDef, b: IngredientDef): number {
  if (a.id === b.id) return 0;
  if (sharedCompoundCount(a.id, b.id) >= MIN_SHARED_COMPOUNDS) return 1;
  return a.pairsWith.includes(b.id) || b.pairsWith.includes(a.id) ? 1 : 0;
}

/**
 * Fraction of chosen ingredients that connect to at least one other chosen
 * ingredient via a known pairing. A dish is "balanced" when every ingredient
 * is tied in by something (often a shared aromatic or fat), not when every
 * possible pair directly pairs — that pairwise-average version unfairly
 * punished larger, perfectly normal dishes since the pairing graph is a
 * sparse, hand-curated sample rather than an exhaustive compatibility matrix.
 */
function averagePairing(defs: IngredientDef[]): number {
  if (defs.length < 2) return 0.5; // neutral score, nothing to clash with
  const connected = defs.filter((d, i) => defs.some((other, j) => j !== i && pairingScore(d, other) > 0)).length;
  return connected / defs.length;
}

/** Average per-100g macros across chosen ingredients — a comparison figure between recipes, not a true per-serving total. */
function averageMacros(defs: IngredientDef[]): Macros {
  const n = Math.max(1, defs.length);
  return {
    calories: defs.reduce((sum, d) => sum + d.macros.calories, 0) / n,
    proteinG: defs.reduce((sum, d) => sum + d.macros.proteinG, 0) / n,
    carbsG: defs.reduce((sum, d) => sum + d.macros.carbsG, 0) / n,
    fatG: defs.reduce((sum, d) => sum + d.macros.fatG, 0) / n,
    sodiumMg: defs.reduce((sum, d) => sum + d.macros.sodiumMg, 0) / n,
  };
}

function urgency(daysUntilExpiry: number): number {
  // 1 = expiring today or already past, 0 = 14+ days out
  return Math.max(0, Math.min(1, 1 - daysUntilExpiry / 14));
}

function daysUntil(dateIso: string | null): number {
  if (!dateIso) return 30; // unknown expiry, treat as non-urgent
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** Greedily pick the pantry ingredient for a role that best pairs with what's already chosen. */
function pickBest(
  candidates: PantryIngredient[],
  role: IngredientRole,
  alreadyChosen: IngredientDef[],
  excludeIds: Set<string>
): PantryIngredient | null {
  const pool = candidates.filter((c) => c.def.roles.includes(role) && !excludeIds.has(c.def.id));
  if (pool.length === 0) return null;
  let best = pool[0];
  let bestScore = -Infinity;
  for (const c of pool) {
    const pairScore = alreadyChosen.reduce((sum, chosen) => sum + pairingScore(c.def, chosen), 0);
    const urgencyScore = urgency(c.daysUntilExpiry);
    const score = pairScore * 2 + urgencyScore; // prefer good pairings, break ties toward using-up-soon items
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

function pickMultiple(
  candidates: PantryIngredient[],
  role: IngredientRole,
  alreadyChosen: IngredientDef[],
  excludeIds: Set<string>,
  limit: number
): PantryIngredient[] {
  const pool = candidates.filter((c) => c.def.roles.includes(role) && !excludeIds.has(c.def.id));
  const scored = pool
    .map((c) => ({
      c,
      score: alreadyChosen.reduce((sum, chosen) => sum + pairingScore(c.def, chosen), 0) + urgency(c.daysUntilExpiry),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.c);
}

function buildRecipeForTechnique(
  technique: TechniqueTemplate,
  pantry: PantryIngredient[]
): GeneratedRecipe | null {
  const chosen: PantryIngredient[] = [];
  const excludeIds = new Set<string>();
  // Tracks which ingredient(s) were picked *for* each role, keyed by role — not re-derived from
  // `chosen` by scanning role membership. That distinction matters because an ingredient can carry
  // multiple roles (e.g. butter is both 'fat' and 'dairy'): if it fills the 'fat' slot, a naive
  // role-membership scan over `chosen` would also match it for a later 'dairy' lookup and shadow
  // whatever was actually picked to fill 'dairy' (e.g. milk), depending on selection order.
  const byRoleAssignment: Partial<Record<IngredientRole, PantryIngredient[]>> = {};

  function assign(role: IngredientRole, picks: PantryIngredient[]) {
    byRoleAssignment[role] = [...(byRoleAssignment[role] ?? []), ...picks];
    picks.forEach((p) => {
      chosen.push(p);
      excludeIds.add(p.def.id);
    });
  }

  function eligibleCount(role: IngredientRole): number {
    return pantry.filter((c) => c.def.roles.includes(role) && !excludeIds.has(c.def.id)).length;
  }

  function fillRole(role: IngredientRole): boolean {
    const isMulti = MULTI_ROLES.includes(role);
    if (isMulti) {
      const picks = pickMultiple(
        pantry,
        role,
        chosen.map((c) => c.def),
        excludeIds,
        MULTI_ROLE_LIMIT
      );
      if (picks.length === 0) return false;
      assign(role, picks);
      return true;
    }
    const pick = pickBest(
      pantry,
      role,
      chosen.map((c) => c.def),
      excludeIds
    );
    if (!pick) return false;
    assign(role, [pick]);
    return true;
  }

  // Required roles are filled most-constrained-first (fewest eligible candidates remaining),
  // recomputed after each pick. An ingredient can satisfy more than one role (eggs are both
  // 'fat' and 'egg'), so filling roles in their declared order can let a generic role's greedy
  // pick consume the only candidate a later, narrower role needed — a real assignment exists,
  // the naive fixed-order fill just doesn't find it. Processing the scarcest role first avoids that.
  const requiredRemaining = [...technique.requiredRoles];
  while (requiredRemaining.length > 0) {
    let bestIdx = 0;
    let bestCount = Infinity;
    for (let i = 0; i < requiredRemaining.length; i++) {
      const count = eligibleCount(requiredRemaining[i]);
      if (count < bestCount) {
        bestCount = count;
        bestIdx = i;
      }
    }
    const role = requiredRemaining.splice(bestIdx, 1)[0];
    if (!fillRole(role)) return null; // required role unfillable
  }

  // Optional roles: same most-constrained-first order, but a miss just skips instead of failing.
  const optionalRemaining = [...technique.optionalRoles];
  while (optionalRemaining.length > 0) {
    let bestIdx = 0;
    let bestCount = Infinity;
    for (let i = 0; i < optionalRemaining.length; i++) {
      const count = eligibleCount(optionalRemaining[i]);
      if (count < bestCount) {
        bestCount = count;
        bestIdx = i;
      }
    }
    const role = optionalRemaining.splice(bestIdx, 1)[0];
    fillRole(role);
  }

  const byRole = (role: IngredientRole) => byRoleAssignment[role] ?? [];
  const ctx: TechniqueContext = {
    protein: byRole('protein')[0]?.def.name,
    fat: byRole('fat')[0]?.def.name,
    acid: byRole('acid')[0]?.def.name,
    aromatics: byRole('aromatic').map((c) => c.def.name),
    starch: byRole('starch')[0]?.def.name,
    vegetables: byRole('vegetable').map((c) => c.def.name),
    dairy: byRole('dairy')[0]?.def.name,
    spices: byRole('spice').map((c) => c.def.name),
    sweetener: byRole('sweetener')[0]?.def.name,
    flour: byRole('flour')[0]?.def.name,
    leavening: byRole('leavening')[0]?.def.name,
    egg: byRole('egg')[0]?.def.name,
    eggWhite: byRole('egg-white')[0]?.def.name,
    eggYolk: byRole('egg-yolk')[0]?.def.name,
  };

  const defs = chosen.map((c) => c.def);
  const balanceScore = averagePairing(defs);
  const wasteScore =
    chosen.reduce((sum, c) => sum + urgency(c.daysUntilExpiry), 0) / Math.max(1, chosen.length);
  const avgHealth = defs.reduce((sum, d) => sum + d.healthScore, 0) / Math.max(1, defs.length);
  const healthScore = Math.max(0, Math.min(1, avgHealth * technique.healthModifier));
  const macros = averageMacros(defs);

  const mainName = ctx.protein ?? defs[0]?.name ?? 'Pantry';
  const title = `${technique.name}: ${mainName}${ctx.vegetables[0] ? ` with ${ctx.vegetables[0]}` : ''}`;

  return {
    id: `${technique.id}-${defs.map((d) => d.id).sort().join('-')}`,
    title,
    technique: technique.id,
    ingredientIds: defs.map((d) => d.id),
    steps: technique.steps(ctx),
    estimatedMinutes: technique.baseMinutes + technique.minutesPerExtraIngredient * Math.max(0, defs.length - technique.requiredRoles.length),
    difficulty: technique.difficulty,
    balanceScore,
    wasteScore,
    healthScore,
    macros,
  };
}

/**
 * Core generator: combines pantry inventory with the technique templates and
 * flavor-pairing graph to produce candidate recipes, instead of looking any
 * up. Runs entirely on-device.
 */
export function generateRecipes(pantryItems: PantryItem[]): GeneratedRecipe[] {
  // Virtual entries let whites/yolks-only techniques draw on whole eggs already in the
  // pantry, without the user having to separately log "egg whites" as their own item.
  const withVirtualItems = [...pantryItems, ...deriveVirtualPantryItems(pantryItems)];
  const pantry: PantryIngredient[] = withVirtualItems
    .map((item) => {
      const def = INGREDIENTS_BY_ID[item.ingredientId];
      if (!def) return null;
      return { item, def, daysUntilExpiry: daysUntil(item.expiresOn) };
    })
    .filter((x): x is PantryIngredient => x !== null);

  const recipes: GeneratedRecipe[] = [];
  for (const technique of TECHNIQUES) {
    const recipe = buildRecipeForTechnique(technique, pantry);
    // Only keep combos that clear a minimum flavor-balance bar.
    if (recipe && recipe.balanceScore >= 0.6) {
      recipes.push(recipe);
    }
  }

  // De-dupe identical ingredient sets across techniques, keep the higher-balance one.
  const byKey = new Map<string, GeneratedRecipe>();
  for (const r of recipes) {
    const existing = byKey.get(r.id);
    if (!existing || r.balanceScore > existing.balanceScore) byKey.set(r.id, r);
  }
  const deduped = Array.from(byKey.values());

  // Suggest pairing recipes that use opposite halves of a split ingredient (e.g. a
  // whites-only meringue paired with a yolks-only custard) so neither half goes to waste.
  pairByproductRecipes(deduped, pantryItems);

  return deduped;
}
