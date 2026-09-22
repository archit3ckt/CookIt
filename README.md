# CookIt

Track what's in your fridge/pantry and what tools you have, then get recipes
*generated* (not searched) from a flavor-pairing rules engine — built to
minimize food waste by prioritizing ingredients close to expiry.

## How it works

1. **Intake** — add pantry items manually, scan a barcode (looked up via Open
   Food Facts), or photograph a receipt (OCR'd via Google Cloud Vision and
   parsed into line items).
2. **Rules engine** (`src/lib/rulesEngine`) — a hand-curated ~135-ingredient
   knowledge base (roles: protein/fat/acid/aromatic/starch/vegetable/dairy/
   spice/sweetener/liquid/flour/leavening/egg, each with a 0-1 simplified
   health heuristic and reference macros per 100g) plus a flavor-pairing
   graph and 16 technique templates. The generator fills each technique's
   required roles with the best-pairing, soonest-expiring pantry items it
   has, most-constrained role first (a standard constraint-satisfaction
   ordering — needed once ingredients can satisfy more than one role, e.g.
   eggs are both `fat` and `egg`, so a generic role's greedy pick can't be
   allowed to consume the only candidate a narrower role needs). It then
   scores the result by how connected the ingredients are — the same shape
   of heuristic a chef uses, encoded as data instead of looked-up recipes.
   Ingredient ids are type-checked against a master list (`ingredients.ts`),
   so a typo'd pairing reference fails `tsc` rather than silently degrading
   the graph.

   Most techniques (sauté, roast, braise, stir-fry, salad, soup, grill,
   bake, steam, poach, deep-fry, blend, meringue, custard) are **flat**: one
   set of roles, one pantry, one linear list of steps. Two aren't, because
   the dish itself isn't flat:

   "Connected" isn't just a hand-guessed list anymore. `flavorCompounds.ts`
   carries real GC/MS-derived aroma-compound data for 112 of the ~139
   ingredients, sourced from Ahn et al.'s "Flavor network and the principles
   of food pairing" (*Scientific Reports*, 2011) — two ingredients pair if
   they share enough real aroma compounds, which is the actual food-pairing
   hypothesis the paper tests, not a guess. Getting this right took real
   tuning: requiring just *any* shared compound makes 66% of all pairs
   "connect" (almost everything shares something), and normalizing by set
   size (Jaccard) is worse — it's dominated by near-duplicate ingredients
   (chicken breast vs. thigh scores 1.00) while missing genuine classics
   like tomato+basil (basil's tiny cataloged compound set makes its Jaccard
   score misleadingly low). A plain shared-compound-count threshold, tuned
   against known pairings, turned out to be the more defensible signal.
   Ingredients outside that 112 (tofu, quinoa, baking powder, and other
   items this 2010-era, largely-Western dataset doesn't cover) fall back to
   the hand-curated `pairsWith` list — nothing regresses for them.

   - `cake` is **ratio-based**: baking doesn't tolerate "roughly this much
     of each role" — a cake is flour:sugar:fat:egg in specific proportions
     or it won't set. It doesn't scale quantities to what's in the pantry
     like the flat techniques do; it outputs a fixed baker's-percentage
     batch (~250g flour) using whichever pantry ingredient fills each role.
   - `kubbeh` is **composite**: a dish assembled from independently-filled
     parts (a bulgur shell, a spiced-meat filling, the broth it simmers in)
     rather than one flat ingredient set. `TechniqueTemplate` is a
     discriminated union (`kind: 'flat' | 'composite'`) — a composite
     technique declares named components, each with its own required/
     optional roles, filled by the same most-constrained-first algorithm
     but sharing one exclusion set across every component (so the same
     onion can't become both the filling's aromatic and the broth's), then
     an `assemble()` function describes how the finished parts combine.
     This is the general layer for any dish with sub-parts — stuffed
     vegetables, pies, layered bakes — not a kubbeh-specific hack.
3. **Byproduct pairing** (`src/lib/rulesEngine/byproducts.ts`) — some
   recipes only use half of an ingredient (a meringue wants egg whites,
   a custard wants yolks). Given whole eggs in the pantry, the generator
   synthesizes "you could separate this" virtual entries so both
   whites-only and yolks-only techniques can be generated in the first
   place, then cross-links whichever meringue/custard pair actually got
   generated so using one flags "pairs with the other, so the leftover
   half isn't wasted." Written as a generic source→component-A/component-B
   registry, not eggs-specific, so a future split (citrus zest vs. juice,
   etc.) is just another registry entry.
4. **Cooking nuance** (`src/lib/rulesEngine/cookingNotes.ts`) — step text
   isn't fixed regardless of what's actually being cooked. Added-oil advice
   scales to the chosen protein's real fat content (from `macros.fatG`):
   bacon/duck-level cuts get "go light, this renders its own fat," while
   chicken breast/cod-level cuts get "don't skimp, it'll stick." Every
   technique's steps now say explicitly whether to cover — braise traps
   moisture and reduces only at the end; sauté/stir-fry/grill/roast stay
   uncovered so browning isn't steamed away; steam depends entirely on a
   tight lid; deep-fry is never covered (oil safety); poach stays uncovered
   so a rolling boil doesn't sneak up unnoticed.
5. **Ranking** — sort suggestions by waste reduction (uses what's expiring
   soonest), time, ease, health, or protein content; filter by max cook time
   or minimum health score.

## Stack

Expo (React Native) + TypeScript, Expo Router for navigation, SQLite
(`expo-sqlite`) for local pantry storage, `expo-camera` for barcode/receipt
capture.

## Setup

```bash
npm install
npx expo start
```

Receipt OCR requires a Google Cloud Vision API key, set as
`expo.extra.googleVisionApiKey` in `app.json` (or injected via an EAS
secret). Barcode lookup uses the free Open Food Facts API and needs no key.

## Project structure

```
src/
  app/                 # Expo Router screens (index=Pantry, scan, recipes, recipe/[id])
  components/          # Shared UI components
  lib/
    types.ts           # Domain types
    db/                # SQLite schema + pantry CRUD + usePantry hook
    rulesEngine/        # ingredients.ts, techniques.ts, generate.ts, rank.ts, byproducts.ts, flavorCompounds.ts, cookingNotes.ts
    barcode.ts          # Open Food Facts lookup
    ocr.ts               # Google Cloud Vision text extraction
    receipt.ts           # OCR text -> candidate pantry items
    recipeCache.ts        # In-memory hand-off from list to detail screen
```
