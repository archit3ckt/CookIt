import { GeneratedRecipe, IngredientDef, IngredientRole, PantryItem, TechniqueContext, TechniqueTemplate } from '../types';
import { INGREDIENTS_BY_ID } from './ingredients';
import { TECHNIQUES } from './techniques';

const MULTI_ROLES: IngredientRole[] = ['aromatic', 'vegetable', 'spice'];
const MULTI_ROLE_LIMIT = 3;

interface PantryIngredient {
  item: PantryItem;
  def: IngredientDef;
  daysUntilExpiry: number;
}

function pairingScore(a: IngredientDef, b: IngredientDef): number {
  if (a.id === b.id) return 0;
  return a.pairsWith.includes(b.id) || b.pairsWith.includes(a.id) ? 1 : 0;
}

function averagePairing(defs: IngredientDef[]): number {
  if (defs.length < 2) return 0.5; // neutral score, nothing to clash with
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < defs.length; i++) {
    for (let j = i + 1; j < defs.length; j++) {
      total += pairingScore(defs[i], defs[j]);
      pairs++;
    }
  }
  return pairs === 0 ? 0.5 : total / pairs;
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

  for (const role of technique.requiredRoles) {
    const isMulti = MULTI_ROLES.includes(role);
    if (isMulti) {
      const picks = pickMultiple(
        pantry,
        role,
        chosen.map((c) => c.def),
        excludeIds,
        MULTI_ROLE_LIMIT
      );
      if (picks.length === 0) return null; // required role unfillable
      picks.forEach((p) => {
        chosen.push(p);
        excludeIds.add(p.def.id);
      });
    } else {
      const pick = pickBest(
        pantry,
        role,
        chosen.map((c) => c.def),
        excludeIds
      );
      if (!pick) return null; // required role unfillable
      chosen.push(pick);
      excludeIds.add(pick.def.id);
    }
  }

  // Fill optional roles opportunistically if pantry supports them.
  for (const role of technique.optionalRoles) {
    const isMulti = MULTI_ROLES.includes(role);
    if (isMulti) {
      const picks = pickMultiple(
        pantry,
        role,
        chosen.map((c) => c.def),
        excludeIds,
        MULTI_ROLE_LIMIT
      );
      picks.forEach((p) => {
        chosen.push(p);
        excludeIds.add(p.def.id);
      });
    } else {
      const pick = pickBest(
        pantry,
        role,
        chosen.map((c) => c.def),
        excludeIds
      );
      if (pick) {
        chosen.push(pick);
        excludeIds.add(pick.def.id);
      }
    }
  }

  const byRole = (role: IngredientRole) => chosen.filter((c) => c.def.roles.includes(role));
  const ctx: TechniqueContext = {
    protein: byRole('protein')[0]?.def.name,
    fat: byRole('fat')[0]?.def.name,
    acid: byRole('acid')[0]?.def.name,
    aromatics: byRole('aromatic').map((c) => c.def.name),
    starch: byRole('starch')[0]?.def.name,
    vegetables: byRole('vegetable').map((c) => c.def.name),
    dairy: byRole('dairy')[0]?.def.name,
    spices: byRole('spice').map((c) => c.def.name),
  };

  const defs = chosen.map((c) => c.def);
  const balanceScore = averagePairing(defs);
  const wasteScore =
    chosen.reduce((sum, c) => sum + urgency(c.daysUntilExpiry), 0) / Math.max(1, chosen.length);

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
  };
}

/**
 * Core generator: combines pantry inventory with the technique templates and
 * flavor-pairing graph to produce candidate recipes, instead of looking any
 * up. Runs entirely on-device.
 */
export function generateRecipes(pantryItems: PantryItem[]): GeneratedRecipe[] {
  const pantry: PantryIngredient[] = pantryItems
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
    if (recipe && recipe.balanceScore >= 0.34) {
      recipes.push(recipe);
    }
  }

  // De-dupe identical ingredient sets across techniques, keep the higher-balance one.
  const byKey = new Map<string, GeneratedRecipe>();
  for (const r of recipes) {
    const existing = byKey.get(r.id);
    if (!existing || r.balanceScore > existing.balanceScore) byKey.set(r.id, r);
  }
  return Array.from(byKey.values());
}
