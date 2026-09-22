/**
 * Small, composable "chef nuance" helpers that adjust generated step text
 * based on an ingredient's actual properties, instead of writing the same
 * fixed instruction regardless of what got picked. Kept separate from
 * techniques.ts so each technique's steps() stays readable.
 */

/**
 * How much added fat a pan actually needs depends on how fatty the protein
 * itself is — a fatty cut self-bastes and can scorch in a well-oiled pan;
 * a lean one will stick and dry out without enough. Thresholds are on
 * grams of fat per 100g (from IngredientDef.macros.fatG): bacon/duck/
 * sausage sit at 20-40+, mid-fat cuts like pork chop/lamb/chicken thigh
 * around 10-17, lean cuts like chicken breast/cod/shrimp under 4.
 */
export function oilAdjustmentNote(proteinFatG: number | undefined): string {
  if (proteinFatG == null) return '';
  if (proteinFatG >= 20) return ' — go light, or skip it: this cut renders plenty of its own fat';
  if (proteinFatG < 8) return ' — this is a lean cut, don\'t skimp or it will stick';
  return '';
}
