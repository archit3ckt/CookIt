import { type SQLiteDatabase } from 'expo-sqlite';
import { MadeRecipe } from '../types';

interface MadeRecipeRow {
  id: string;
  recipeId: string;
  title: string;
  technique: string;
  ingredientIds: string;
  steps: string;
  estimatedMinutes: number;
  difficulty: number;
  healthScore: number;
  macros: string;
  madeOn: string;
  liked: number;
}

function fromRow(row: MadeRecipeRow): MadeRecipe {
  return {
    ...row,
    technique: row.technique as MadeRecipe['technique'],
    ingredientIds: JSON.parse(row.ingredientIds),
    steps: JSON.parse(row.steps),
    difficulty: row.difficulty as MadeRecipe['difficulty'],
    macros: JSON.parse(row.macros),
    liked: row.liked === 1,
  };
}

export async function listMadeRecipes(db: SQLiteDatabase): Promise<MadeRecipe[]> {
  const rows = await db.getAllAsync<MadeRecipeRow>('SELECT * FROM made_recipes ORDER BY madeOn DESC');
  return rows.map(fromRow);
}

export async function insertMadeRecipe(db: SQLiteDatabase, recipe: MadeRecipe): Promise<void> {
  await db.runAsync(
    `INSERT INTO made_recipes (id, recipeId, title, technique, ingredientIds, steps, estimatedMinutes, difficulty, healthScore, macros, madeOn, liked)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipe.id,
      recipe.recipeId,
      recipe.title,
      recipe.technique,
      JSON.stringify(recipe.ingredientIds),
      JSON.stringify(recipe.steps),
      recipe.estimatedMinutes,
      recipe.difficulty,
      recipe.healthScore,
      JSON.stringify(recipe.macros),
      recipe.madeOn,
      recipe.liked ? 1 : 0,
    ]
  );
}

export async function setMadeRecipeLiked(db: SQLiteDatabase, id: string, liked: boolean): Promise<void> {
  await db.runAsync('UPDATE made_recipes SET liked = ? WHERE id = ?', [liked ? 1 : 0, id]);
}
