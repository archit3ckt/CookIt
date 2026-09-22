import { GeneratedRecipe, RecipeSort } from '../types';

export function healthLabel(score: number): string {
  if (score >= 0.75) return 'Nutrient-dense';
  if (score >= 0.55) return 'Balanced';
  return 'Indulgent';
}

export interface RecipeFilters {
  maxMinutes?: number;
  maxDifficulty?: 1 | 2 | 3;
  minHealth?: number;
}

export function filterAndSort(
  recipes: GeneratedRecipe[],
  sort: RecipeSort,
  filters: RecipeFilters = {}
): GeneratedRecipe[] {
  let result = recipes;
  if (filters.maxMinutes != null) {
    result = result.filter((r) => r.estimatedMinutes <= filters.maxMinutes!);
  }
  if (filters.maxDifficulty != null) {
    result = result.filter((r) => r.difficulty <= filters.maxDifficulty!);
  }
  if (filters.minHealth != null) {
    result = result.filter((r) => r.healthScore >= filters.minHealth!);
  }

  const sorted = [...result];
  switch (sort) {
    case 'waste':
      sorted.sort((a, b) => b.wasteScore - a.wasteScore || b.balanceScore - a.balanceScore);
      break;
    case 'time':
      sorted.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
      break;
    case 'ease':
      sorted.sort((a, b) => a.difficulty - b.difficulty || a.estimatedMinutes - b.estimatedMinutes);
      break;
    case 'health':
      sorted.sort((a, b) => b.healthScore - a.healthScore || b.balanceScore - a.balanceScore);
      break;
  }
  return sorted;
}
