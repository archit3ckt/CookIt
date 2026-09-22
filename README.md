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
   graph and 13 technique templates (sauté, roast, braise, stir-fry, salad,
   soup, grill, bake, steam, poach, deep-fry, blend, cake). The generator
   fills each technique's required roles with the best-pairing,
   soonest-expiring pantry items it has, most-constrained role first (a
   standard constraint-satisfaction ordering — needed once ingredients can
   satisfy more than one role, e.g. eggs are both `fat` and `egg`, so a
   generic role's greedy pick can't be allowed to consume the only candidate
   a narrower role needs). It then scores the result by how connected the
   ingredients are (does everything tie in via a shared aromatic/fat/acid?)
   — the same shape of heuristic a chef uses, encoded as data instead of
   looked-up recipes. Ingredient ids are type-checked against a master list
   (`ingredients.ts`), so a typo'd pairing reference fails `tsc` rather than
   silently degrading the graph.

   Baking is a structurally different problem from savory cooking — a cake
   isn't "protein+fat+aromatic present," it's flour:sugar:fat:egg in
   specific ratios, or it won't set. The `cake` technique doesn't scale
   quantities to what's in the pantry like savory techniques do; it outputs
   a fixed baker's-percentage batch (~250g flour) using whichever pantry
   ingredient fills each role.
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
4. **Ranking** — sort suggestions by waste reduction (uses what's expiring
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
    rulesEngine/        # ingredients.ts, techniques.ts, generate.ts, rank.ts, byproducts.ts
    barcode.ts          # Open Food Facts lookup
    ocr.ts               # Google Cloud Vision text extraction
    receipt.ts           # OCR text -> candidate pantry items
    recipeCache.ts        # In-memory hand-off from list to detail screen
```
