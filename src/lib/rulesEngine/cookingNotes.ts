import { Technique } from '../types';

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

type CutKind = 'aromatic' | 'vegetable' | 'protein';

/**
 * The prep size a technique implies for a role, driven by how fast and how
 * evenly it needs to cook — a stir-fry needs thin pieces that finish in
 * seconds, a sheet-pan roast can take large chunks with 25-35 minutes to
 * caramelize, a poaching liquid's aromatics just need to be fished out
 * later so stay rough. Only listed where the technique's steps() actually
 * names that role — no entry for a role/technique pair the text never
 * mentions. Returns '' (no prefix) elsewhere, including techniques where
 * cut size genuinely doesn't matter (blending purees whatever goes in).
 */
const CUT_STYLES: Partial<Record<Technique, Partial<Record<CutKind, string>>>> = {
  saute: { aromatic: 'minced ' },
  roast: { vegetable: 'large-chunked ' },
  braise: { aromatic: 'diced ' },
  'stir-fry': { aromatic: 'minced ', vegetable: 'thinly sliced ', protein: 'thinly sliced ' },
  'raw-salad': { vegetable: 'chopped ' },
  'simmer-soup': { aromatic: 'diced ', vegetable: 'diced ' },
  bake: { vegetable: 'thinly sliced ' },
  steam: { vegetable: 'bite-size ' },
  poach: { aromatic: 'rough-chopped ' },
  kubbeh: { aromatic: 'minced ' },
  shawarma: { vegetable: 'thinly sliced ' },
};

export function cutStyle(technique: Technique, kind: CutKind): string {
  return CUT_STYLES[technique]?.[kind] ?? '';
}
