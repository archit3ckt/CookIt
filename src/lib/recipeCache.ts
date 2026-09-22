import { GeneratedRecipe } from './types';

/**
 * Generated recipes are derived data (pantry -> rules engine), not stored
 * in SQLite. This in-memory cache lets the recipe detail screen look one up
 * by id after the list screen generated it, without re-serializing the
 * whole recipe through router params.
 */
let cache = new Map<string, GeneratedRecipe>();

export function cacheRecipes(recipes: GeneratedRecipe[]) {
  cache = new Map(recipes.map((r) => [r.id, r]));
}

export function getCachedRecipe(id: string): GeneratedRecipe | undefined {
  return cache.get(id);
}
