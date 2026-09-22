# CookIt

Track what's in your fridge/pantry and what tools you have, then get recipes
*generated* (not searched) from a flavor-pairing rules engine — built to
minimize food waste by prioritizing ingredients close to expiry.

## How it works

1. **Intake** — add pantry items manually, scan a barcode (looked up via Open
   Food Facts), or photograph a receipt (OCR'd via Google Cloud Vision and
   parsed into line items).
2. **Rules engine** (`src/lib/rulesEngine`) — a hand-curated ~130-ingredient
   knowledge base (roles: protein/fat/acid/aromatic/starch/vegetable/dairy/
   spice/sweetener/liquid, each with a 0-1 simplified health heuristic and
   reference macros per 100g) plus a flavor-pairing graph and 12 technique
   templates (sauté, roast, braise, stir-fry, salad, soup, grill, bake,
   steam, poach, deep-fry, blend). The generator fills each technique's
   required roles with the best-pairing, soonest-expiring pantry items it
   has, then scores the result by how connected the ingredients are (does
   everything tie in via a shared aromatic/fat/acid?) — the same shape of
   heuristic a chef uses, encoded as data instead of looked-up recipes.
   Ingredient ids are type-checked against a master list (`ingredients.ts`),
   so a typo'd pairing reference fails `tsc` rather than silently degrading
   the graph.
3. **Ranking** — sort suggestions by waste reduction (uses what's expiring
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
    rulesEngine/        # ingredients.ts, techniques.ts, generate.ts, rank.ts
    barcode.ts          # Open Food Facts lookup
    ocr.ts               # Google Cloud Vision text extraction
    receipt.ts           # OCR text -> candidate pantry items
    recipeCache.ts        # In-memory hand-off from list to detail screen
```
