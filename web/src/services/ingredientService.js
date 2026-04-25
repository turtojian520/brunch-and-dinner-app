import { SupabaseService } from './supabaseService';
import { supabase } from '../config/supabase';

/**
 * Ingredient Service
 * Handles all ingredient inventory operations
 */

export class IngredientService {
  /**
   * Get all ingredients from user's inventory
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getAllIngredients() {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });
    }, 'Get all ingredients');
  }

  /**
   * Get user's personal ingredients (source = 'my_ingredients')
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getMyIngredients() {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('ingredients')
        .select('*')
        .eq('source', 'my_ingredients')
        .order('created_at', { ascending: false });
    }, 'Get my ingredients');
  }

  /**
   * Get ingredients by category
   * @param {string} category - Category name
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getIngredientsByCategory(category) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('ingredients')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });
    }, `Get ${category} ingredients`);
  }

  /**
   * Get ingredients expiring within specified days
   * @param {number} days - Number of days to check
   * @returns {Promise<Object>} { success, data, error }
   */
  static async getExpiringSoon(days = 7) {
    return SupabaseService.execute(async () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      return await supabase
        .from('ingredients')
        .select('*')
        .lte('expiration_date', targetDateStr)
        .order('expiration_date', { ascending: true });
    }, `Get ingredients expiring within ${days} days`);
  }

  /**
   * Search ingredients by name
   * @param {string} query - Search query
   * @returns {Promise<Object>} { success, data, error }
   */
  static async searchIngredients(query) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('ingredients')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true });
    }, `Search ingredients: ${query}`);
  }

  /**
   * Create a new ingredient
   * @param {Object} ingredientData - Ingredient object
   * @returns {Promise<Object>} { success, data, error }
   */
  static async createIngredient(ingredientData) {
    return SupabaseService.execute(async () => {
      const addedDate = ingredientData.addedDate || new Date().toISOString().split('T')[0];

      return await supabase
        .from('ingredients')
        .insert([{
          name: ingredientData.name,
          category: ingredientData.category,
          quantity: parseFloat(ingredientData.quantity),
          unit: ingredientData.unit,
          added_date: addedDate,
          shelf_life_days: parseInt(ingredientData.shelfLifeDays || ingredientData.shelf_life_days || 7),
          source: ingredientData.source || 'my_ingredients',
        }])
        .select()
        .single();
    }, 'Create ingredient');
  }

  /**
   * Update an existing ingredient
   * @param {string} id - Ingredient UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} { success, data, error }
   */
  static async updateIngredient(id, updates) {
    return SupabaseService.execute(async () => {
      const updateData = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.category) updateData.category = updates.category;
      if (updates.quantity !== undefined) updateData.quantity = parseFloat(updates.quantity);
      if (updates.unit) updateData.unit = updates.unit;
      if (updates.shelfLifeDays || updates.shelf_life_days) {
        updateData.shelf_life_days = parseInt(updates.shelfLifeDays || updates.shelf_life_days);
      }
      if (updates.addedDate || updates.added_date) {
        updateData.added_date = updates.addedDate || updates.added_date;
      }

      return await supabase
        .from('ingredients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    }, `Update ingredient ${id}`);
  }

  /**
   * Delete an ingredient
   * @param {string} id - Ingredient UUID
   * @returns {Promise<Object>} { success, data, error }
   */
  static async deleteIngredient(id) {
    return SupabaseService.execute(async () => {
      return await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);
    }, `Delete ingredient ${id}`);
  }

  /**
   * Sort ingredients
   * @param {Array} ingredients - Array of ingredients
   * @param {string} sortBy - 'name', 'quantity', or 'expiration'
   * @returns {Array} - Sorted ingredients
   */
  static sortIngredients(ingredients, sortBy = 'name') {
    if (!ingredients || !Array.isArray(ingredients)) return [];

    const sorted = [...ingredients];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'quantity':
        return sorted.sort((a, b) => parseFloat(b.quantity) - parseFloat(a.quantity));

      case 'expiration':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.expiration_date || a.expirationDate);
          const dateB = new Date(b.expiration_date || b.expirationDate);
          return dateA - dateB;
        });

      default:
        return sorted;
    }
  }

  /**
   * Filter ingredients by multiple criteria
   * @param {Array} ingredients - Array of ingredients
   * @param {Object} filters - Filter criteria
   * @returns {Array} - Filtered ingredients
   */
  static filterIngredients(ingredients, filters = {}) {
    if (!ingredients || !Array.isArray(ingredients)) return [];

    let filtered = [...ingredients];

    // Filter by source
    if (filters.source && filters.source !== 'all') {
      filtered = filtered.filter(ing =>
        ing.source === filters.source || ing.source === filters.source.replace(/_/g, ' ')
      );
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(ing =>
        ing.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(ing =>
        ing.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * Transform Supabase ingredient format to frontend format
   * @param {Object} supabaseIngredient - Ingredient from Supabase
   * @returns {Object} - Ingredient in frontend format
   */
  static transformToFrontend(supabaseIngredient) {
    if (!supabaseIngredient) return null;

    return {
      id: supabaseIngredient.id,
      name: supabaseIngredient.name,
      category: supabaseIngredient.category,
      quantity: supabaseIngredient.quantity?.toString() || '0',
      unit: supabaseIngredient.unit,
      addedDate: supabaseIngredient.added_date,
      shelfLifeDays: supabaseIngredient.shelf_life_days?.toString() || '7',
      expirationDate: supabaseIngredient.expiration_date,
      source: supabaseIngredient.source === 'my_ingredients' ? 'my' : 'recipe',
    };
  }

  /**
   * Transform array of Supabase ingredients to frontend format
   * @param {Array} ingredients - Array of ingredients from Supabase
   * @returns {Array} - Array of ingredients in frontend format
   */
  static transformArrayToFrontend(ingredients) {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    return ingredients.map(ing => this.transformToFrontend(ing));
  }
}

export default IngredientService;
