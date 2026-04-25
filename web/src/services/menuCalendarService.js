import { SupabaseService } from './supabaseService';
import { supabase } from '../config/supabase';

/**
 * Menu Calendar Service
 * Handles menu calendar operations for meal planning
 */

export class MenuCalendarService {
  /**
   * Get menu entries for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getMenuByDate(date) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('menu_calendar')
        .select(`
          *,
          recipes (
            *,
            recipe_ingredients (*)
          )
        `)
        .eq('date', date)
        .order('meal_type', { ascending: true });
    }, `Get menu for ${date}`);
  }

  /**
   * Get menu entries for a date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getMenuByDateRange(startDate, endDate) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('menu_calendar')
        .select(`
          *,
          recipes (
            *,
            recipe_ingredients (*)
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('meal_type', { ascending: true });
    }, `Get menu from ${startDate} to ${endDate}`);
  }

  /**
   * Get all marked dates (dates with planned meals)
   * Returns dates for calendar visualization
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getMarkedDates() {
    return SupabaseService.execute(async () => {
      const response = await supabase
        .from('menu_calendar')
        .select('date')
        .order('date', { ascending: true });

      if (response.error) {
        return response;
      }

      // Transform to unique dates object for calendar component
      const markedDates = {};
      const uniqueDates = [...new Set(response.data.map(item => item.date))];

      uniqueDates.forEach(date => {
        markedDates[date] = { marked: true, dotColor: '#FF6B6B' };
      });

      return {
        data: markedDates,
        error: null,
      };
    }, 'Get marked dates');
  }

  /**
   * Add a recipe to the menu calendar
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} recipeId - Recipe UUID
   * @param {string} mealType - 'breakfast', 'lunch', or 'dinner'
   * @returns {Promise<Object>} { success, data, error }
   */
  static async addRecipeToMenu(date, recipeId, mealType) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('menu_calendar')
        .insert([{
          date: date,
          recipe_id: recipeId,
          meal_type: mealType,
        }])
        .select(`
          *,
          recipes (
            *,
            recipe_ingredients (*)
          )
        `)
        .single();
    }, `Add recipe to menu on ${date}`);
  }

  /**
   * Add multiple recipes to menu calendar
   * @param {Array} entries - Array of { date, recipeId, mealType }
   * @returns {Promise<Object>} { success, data, error }
   */
  static async addMultipleRecipesToMenu(entries) {
    return SupabaseService.execute(async () => {
      const insertData = entries.map(entry => ({
        date: entry.date,
        recipe_id: entry.recipeId || entry.recipe_id,
        meal_type: entry.mealType || entry.meal_type,
      }));

      return await supabase
        .from('menu_calendar')
        .insert(insertData)
        .select(`
          *,
          recipes (
            *,
            recipe_ingredients (*)
          )
        `);
    }, 'Add multiple recipes to menu');
  }

  /**
   * Remove a menu entry
   * @param {string} id - Menu calendar entry UUID
   * @returns {Promise<Object>} { success, data, error }
   */
  static async removeRecipeFromMenu(id) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('menu_calendar')
        .delete()
        .eq('id', id);
    }, `Remove menu entry ${id}`);
  }

  /**
   * Remove recipe from menu by date and recipe ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} recipeId - Recipe UUID
   * @returns {Promise<Object>} { success, data, error }
   */
  static async removeRecipeByDateAndId(date, recipeId) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('menu_calendar')
        .delete()
        .eq('date', date)
        .eq('recipe_id', recipeId);
    }, `Remove recipe from menu on ${date}`);
  }

  /**
   * Update a menu entry
   * @param {string} id - Menu calendar entry UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} { success, data, error }
   */
  static async updateMenuEntry(id, updates) {
    return SupabaseService.execute(async () => {
      const updateData = {};

      if (updates.date) updateData.date = updates.date;
      if (updates.mealType || updates.meal_type) {
        updateData.meal_type = updates.mealType || updates.meal_type;
      }

      return await supabase
        .from('menu_calendar')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          recipes (
            *,
            recipe_ingredients (*)
          )
        `)
        .single();
    }, `Update menu entry ${id}`);
  }

  /**
   * Get recipes grouped by meal type for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} { success, data: { breakfast: [], lunch: [], dinner: [] }, error }
   */
  static async getGroupedMenuByDate(date) {
    const result = await this.getMenuByDate(date);

    if (!result.success || !result.data) {
      return result;
    }

    // Group recipes by meal type
    const grouped = {
      breakfast: [],
      lunch: [],
      dinner: [],
    };

    result.data.forEach(entry => {
      const mealType = entry.meal_type;
      if (grouped[mealType] && entry.recipes) {
        grouped[mealType].push(entry.recipes);
      }
    });

    return {
      success: true,
      data: grouped,
      error: null,
    };
  }

  /**
   * Transform Supabase menu entry to frontend format
   * @param {Object} entry - Menu entry from Supabase
   * @returns {Object} - Menu entry in frontend format
   */
  static transformToFrontend(entry) {
    if (!entry) return null;

    return {
      id: entry.id,
      date: entry.date,
      mealType: entry.meal_type,
      recipe: entry.recipes ? this.transformRecipe(entry.recipes) : null,
    };
  }

  /**
   * Transform recipe from menu entry
   * @param {Object} recipe - Recipe object from Supabase
   * @returns {Object} - Recipe in frontend format
   */
  static transformRecipe(recipe) {
    if (!recipe) return null;

    return {
      id: recipe.id,
      name: recipe.name,
      mealType: recipe.meal_type,
      difficulty: recipe.difficulty,
      time: recipe.time,
      steps: recipe.steps || [],
      ingredients: (recipe.recipe_ingredients || []).map(ing => ({
        name: ing.name,
        property: ing.property,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    };
  }

  /**
   * Transform array of menu entries to frontend format
   * @param {Array} entries - Array of menu entries from Supabase
   * @returns {Array} - Array in frontend format
   */
  static transformArrayToFrontend(entries) {
    if (!entries || !Array.isArray(entries)) return [];
    return entries.map(entry => this.transformToFrontend(entry));
  }

  /**
   * Convert grouped menu data to frontend format
   * @param {Object} grouped - Grouped menu data from Supabase
   * @returns {Object} - Object with breakfast, lunch, dinner arrays
   */
  static transformGroupedToFrontend(grouped) {
    if (!grouped) return { breakfast: [], lunch: [], dinner: [] };

    return {
      breakfast: grouped.breakfast?.map(r => this.transformRecipe(r)) || [],
      lunch: grouped.lunch?.map(r => this.transformRecipe(r)) || [],
      dinner: grouped.dinner?.map(r => this.transformRecipe(r)) || [],
    };
  }
}

export default MenuCalendarService;
