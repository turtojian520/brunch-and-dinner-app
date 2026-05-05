import { SupabaseService } from './supabaseService';
import { supabase } from '../config/supabase';

/**
 * Recipe Service
 * Handles all recipe-related database operations
 */

export class RecipeService {
  /**
   * Fetch all recipes with their ingredients
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getAllRecipes() {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            id,
            name,
            property,
            quantity,
            unit
          )
        `)
        .order('created_at', { ascending: false });
    }, 'Get all recipes');
  }

  /**
   * Get a single recipe by ID
   * @param {string} id - Recipe UUID
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getRecipeById(id) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            id,
            name,
            property,
            quantity,
            unit
          )
        `)
        .eq('id', id)
        .single();
    }, `Get recipe ${id}`);
  }

  /**
   * Get recipes filtered by meal type
   * @param {string} mealType - 'breakfast', 'lunch', or 'dinner'
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getRecipesByMealType(mealType) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (*)
        `)
        .eq('meal_type', mealType)
        .order('created_at', { ascending: false });
    }, `Get ${mealType} recipes`);
  }

  /**
   * Get recipes filtered by difficulty
   * @param {string} difficulty - 'easy', 'medium', or 'difficult'
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getRecipesByDifficulty(difficulty) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (*)
        `)
        .eq('difficulty', difficulty)
        .order('created_at', { ascending: false });
    }, `Get ${difficulty} recipes`);
  }

  /**
   * Get random recipes for daily menu
   * @param {number} count - Number of recipes to fetch
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getRandomRecipes(count = 4) {
    const result = await this.getAllRecipes();

    if (result.success && result.data) {
      // Shuffle and take 'count' recipes
      const shuffled = [...result.data].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));

      return {
        success: true,
        data: selected,
        error: null,
      };
    }

    return result;
  }

  /**
   * Create a new recipe with ingredients
   * @param {Object} recipeData - Recipe object with ingredients array
   * @returns {Promise<Object>} { success, data, error }
   */
  static async createRecipe(recipeData) {
    return SupabaseService.execute(async () => {
      const { ingredients, steps, ...recipeInfo } = recipeData;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const insertRow = {
        name: recipeInfo.name,
        meal_type: recipeInfo.mealType || recipeInfo.meal_type,
        difficulty: recipeInfo.difficulty,
        time: parseInt(recipeInfo.time),
        steps: steps || [],
      };
      if (recipeInfo.id && uuidRegex.test(recipeInfo.id)) {
        insertRow.id = recipeInfo.id;
      }

      // Insert recipe
      const recipeResponse = await supabase
        .from('recipes')
        .insert([insertRow])
        .select()
        .single();

      if (recipeResponse.error) {
        return recipeResponse;
      }

      const recipeId = recipeResponse.data.id;

      // Insert ingredients if provided
      if (ingredients && ingredients.length > 0) {
        const ingredientsData = ingredients.map(ing => ({
          recipe_id: recipeId,
          name: ing.name,
          property: ing.property,
          quantity: ing.quantity,
          unit: ing.unit,
        }));

        const ingredientsResponse = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsData);

        if (ingredientsResponse.error) {
          // Rollback: delete the recipe if ingredients insertion fails
          await supabase.from('recipes').delete().eq('id', recipeId);
          return ingredientsResponse;
        }
      }

      // Fetch complete recipe with ingredients
      return await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (*)
        `)
        .eq('id', recipeId)
        .single();
    }, 'Create recipe');
  }

  /**
   * Update an existing recipe
   * @param {string} id - Recipe UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} { success, data, error }
   */
  static async updateRecipe(id, updates) {
    return SupabaseService.execute(async () => {
      const updateData = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.mealType || updates.meal_type) {
        updateData.meal_type = updates.mealType || updates.meal_type;
      }
      if (updates.difficulty) updateData.difficulty = updates.difficulty;
      if (updates.time) updateData.time = parseInt(updates.time);
      if (updates.steps) updateData.steps = updates.steps;

      return await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          recipe_ingredients (*)
        `)
        .single();
    }, `Update recipe ${id}`);
  }

  /**
   * Delete a recipe
   * @param {string} id - Recipe UUID
   * @returns {Promise<Object>} { success, data, error }
   */
  static async deleteRecipe(id) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('recipes')
        .delete()
        .eq('id', id);
    }, `Delete recipe ${id}`);
  }

  /**
   * Search recipes by name
   * @param {string} query - Search query
   * @returns {Promise<Object>} { success, data, error }
   */
  static async searchRecipes(query) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (*)
        `)
        .ilike('name', `%${query}%`)
        .order('created_at', { ascending: false });
    }, `Search recipes: ${query}`);
  }

  /**
   * Transform Supabase recipe format to frontend format
   * @param {Object} supabaseRecipe - Recipe from Supabase
   * @returns {Object} - Recipe in frontend format
   */
  static transformToFrontend(supabaseRecipe) {
    if (!supabaseRecipe) return null;

    return {
      id: supabaseRecipe.id,
      name: supabaseRecipe.name,
      mealType: supabaseRecipe.meal_type,
      difficulty: supabaseRecipe.difficulty,
      time: supabaseRecipe.time,
      steps: supabaseRecipe.steps || [],
      ingredients: (supabaseRecipe.recipe_ingredients || []).map(ing => ({
        name: ing.name,
        property: ing.property,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    };
  }

  /**
   * Transform array of Supabase recipes to frontend format
   * @param {Array} recipes - Array of recipes from Supabase
   * @returns {Array} - Array of recipes in frontend format
   */
  static transformArrayToFrontend(recipes) {
    if (!recipes || !Array.isArray(recipes)) return [];
    return recipes.map(recipe => this.transformToFrontend(recipe));
  }
}

export default RecipeService;
