import { SupabaseService } from './supabaseService';
import { supabase } from '../config/supabase';
import { getData, saveData, StorageKeys } from '../utils/storage';
import { mockRecipes } from '../data/mockRecipes';

/**
 * Recipe Service
 * Handles all recipe-related operations with offline-first support.
 */
export class RecipeService {
  /**
   * Helper to load recipes from local storage
   */
  static async getLocalRecipes() {
    let recipes = await getData(StorageKeys.RECIPES);
    if (!recipes || recipes.length === 0) {
      recipes = [...mockRecipes];
      await saveData(StorageKeys.RECIPES, recipes);
    }
    return recipes;
  }

  /**
   * Fetch all recipes with their ingredients
   */
  static async getAllRecipes() {
    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
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

      if (result.success && result.data) {
        // Sync cache to local storage
        const transformed = this.transformArrayToFrontend(result.data);
        await saveData(StorageKeys.RECIPES, transformed);
        return { success: true, data: result.data, error: null };
      }
    }

    // Offline fallback
    const local = await this.getLocalRecipes();
    // Wrap ingredients into the db format structure for compatibility if needed,
    // or return the local ones in frontend format directly.
    return {
      success: true,
      data: this.transformArrayToSupabaseFormat(local),
      error: null
    };
  }

  /**
   * Get a single recipe by ID
   */
  static async getRecipeById(id) {
    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
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

      if (result.success && result.data) {
        return result;
      }
    }

    // Local lookup
    const local = await this.getLocalRecipes();
    const recipe = local.find(r => r.id === id);
    if (recipe) {
      return {
        success: true,
        data: this.transformToSupabaseFormat(recipe),
        error: null
      };
    }

    return { success: false, data: null, error: 'Recipe not found' };
  }

  /**
   * Create a new recipe with ingredients
   */
  static async createRecipe(recipeData) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const newId = recipeData.id && uuidRegex.test(recipeData.id) 
      ? recipeData.id 
      : crypto.randomUUID();

    const formattedRecipe = {
      id: newId,
      name: recipeData.name,
      mealType: recipeData.mealType || recipeData.meal_type || 'lunch',
      difficulty: recipeData.difficulty || 'easy',
      time: parseInt(recipeData.time) || 20,
      steps: recipeData.steps || [],
      ingredients: recipeData.ingredients || [],
      created_at: new Date().toISOString()
    };

    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
        const { ingredients, steps, ...recipeInfo } = formattedRecipe;
        const insertRow = {
          id: newId,
          name: recipeInfo.name,
          meal_type: recipeInfo.mealType,
          difficulty: recipeInfo.difficulty,
          time: recipeInfo.time,
          steps: steps,
        };

        const recipeResponse = await supabase
          .from('recipes')
          .insert([insertRow])
          .select()
          .single();

        if (recipeResponse.error) return recipeResponse;

        if (ingredients && ingredients.length > 0) {
          const ingredientsData = ingredients.map(ing => ({
            recipe_id: newId,
            name: ing.name,
            property: ing.property || 'other',
            quantity: ing.quantity || '1',
            unit: ing.unit || 'pcs',
          }));

          const ingredientsResponse = await supabase
            .from('recipe_ingredients')
            .insert(ingredientsData);

          if (ingredientsResponse.error) {
            await supabase.from('recipes').delete().eq('id', newId);
            return ingredientsResponse;
          }
        }

        return await supabase
          .from('recipes')
          .select(`
            *,
            recipe_ingredients (*)
          `)
          .eq('id', newId)
          .single();
      }, 'Create recipe');

      if (result.success) {
        // Update local cache
        const local = await this.getLocalRecipes();
        local.unshift(formattedRecipe);
        await saveData(StorageKeys.RECIPES, local);
        return result;
      }
    }

    // Local save
    const local = await this.getLocalRecipes();
    local.unshift(formattedRecipe);
    await saveData(StorageKeys.RECIPES, local);

    return {
      success: true,
      data: this.transformToSupabaseFormat(formattedRecipe),
      error: null
    };
  }

  /**
   * Delete a recipe
   */
  static async deleteRecipe(id) {
    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
        return await supabase
          .from('recipes')
          .delete()
          .eq('id', id);
      }, `Delete recipe ${id}`);

      if (result.success) {
        const local = await this.getLocalRecipes();
        const filtered = local.filter(r => r.id !== id);
        await saveData(StorageKeys.RECIPES, filtered);
        return result;
      }
    }

    const local = await this.getLocalRecipes();
    const filtered = local.filter(r => r.id !== id);
    await saveData(StorageKeys.RECIPES, filtered);

    return { success: true, data: null, error: null };
  }

  /**
   * Helper to format frontend recipe into Supabase DB structure
   */
  static transformToSupabaseFormat(recipe) {
    if (!recipe) return null;
    return {
      id: recipe.id,
      name: recipe.name,
      meal_type: recipe.mealType || recipe.meal_type,
      difficulty: recipe.difficulty,
      time: recipe.time,
      steps: recipe.steps || [],
      recipe_ingredients: (recipe.ingredients || []).map((ing, index) => ({
        id: ing.id || index,
        name: ing.name,
        property: ing.property,
        quantity: ing.quantity,
        unit: ing.unit,
      }))
    };
  }

  static transformArrayToSupabaseFormat(recipes) {
    if (!recipes) return [];
    return recipes.map(r => this.transformToSupabaseFormat(r));
  }

  /**
   * Transform Supabase recipe format to frontend format
   */
  static transformToFrontend(supabaseRecipe) {
    if (!supabaseRecipe) return null;

    return {
      id: supabaseRecipe.id,
      name: supabaseRecipe.name,
      mealType: supabaseRecipe.meal_type || supabaseRecipe.mealType,
      difficulty: supabaseRecipe.difficulty,
      time: supabaseRecipe.time,
      steps: supabaseRecipe.steps || [],
      ingredients: (supabaseRecipe.recipe_ingredients || supabaseRecipe.ingredients || []).map(ing => ({
        name: ing.name,
        property: ing.property,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    };
  }

  /**
   * Transform array of Supabase recipes to frontend format
   */
  static transformArrayToFrontend(recipes) {
    if (!recipes || !Array.isArray(recipes)) return [];
    return recipes.map(recipe => this.transformToFrontend(recipe));
  }
}

export default RecipeService;
