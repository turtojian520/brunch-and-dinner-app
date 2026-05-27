import { SupabaseService } from './supabaseService';
import { supabase } from '../config/supabase';
import { getData, saveData, StorageKeys } from '../utils/storage';

const defaultIngredients = [
  {
    id: 'i1',
    name: 'Eggs',
    category: 'protein',
    quantity: '6',
    unit: 'pcs',
    addedDate: new Date().toISOString().split('T')[0],
    shelfLifeDays: '14',
    source: 'my_ingredients'
  },
  {
    id: 'i2',
    name: 'Butter',
    category: 'dairy',
    quantity: '200',
    unit: 'g',
    addedDate: new Date().toISOString().split('T')[0],
    shelfLifeDays: '30',
    source: 'my_ingredients'
  },
  {
    id: 'i3',
    name: 'Bread',
    category: 'grain',
    quantity: '4',
    unit: 'slices',
    addedDate: new Date().toISOString().split('T')[0],
    shelfLifeDays: '5',
    source: 'my_ingredients'
  },
  {
    id: 'i4',
    name: 'Chicken Breast',
    category: 'meat',
    quantity: '300',
    unit: 'g',
    addedDate: new Date().toISOString().split('T')[0],
    shelfLifeDays: '3',
    source: 'my_ingredients'
  },
  {
    id: 'i5',
    name: 'Tomatoes',
    category: 'vegetable',
    quantity: '5',
    unit: 'pcs',
    addedDate: new Date().toISOString().split('T')[0],
    shelfLifeDays: '7',
    source: 'my_ingredients'
  }
];

export class IngredientService {
  /**
   * Helper to get ingredients from local storage
   */
  static async getLocalIngredients() {
    let list = await getData(StorageKeys.INGREDIENTS);
    if (!list || list.length === 0) {
      list = [...defaultIngredients];
      await saveData(StorageKeys.INGREDIENTS, list);
    }
    return list;
  }

  /**
   * Helper to compute expiration date
   */
  static computeExpiration(addedDate, shelfLifeDays) {
    const date = new Date(addedDate);
    date.setDate(date.getDate() + parseInt(shelfLifeDays || 7));
    return date.toISOString().split('T')[0];
  }

  /**
   * Get all ingredients from user's inventory
   */
  static async getAllIngredients() {
    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
        return await supabase
          .from('ingredients')
          .select('*')
          .order('created_at', { ascending: false });
      }, 'Get all ingredients');

      if (result.success && result.data) {
        const transformed = this.transformArrayToFrontend(result.data);
        await saveData(StorageKeys.INGREDIENTS, transformed);
        return { success: true, data: result.data, error: null };
      }
    }

    const local = await this.getLocalIngredients();
    return {
      success: true,
      data: this.transformArrayToSupabaseFormat(local),
      error: null
    };
  }

  /**
   * Create a new ingredient
   */
  static async createIngredient(ingredientData) {
    const newId = crypto.randomUUID();
    const addedDate = ingredientData.addedDate || new Date().toISOString().split('T')[0];
    const shelfLifeDays = ingredientData.shelfLifeDays || '7';
    
    const formatted = {
      id: newId,
      name: ingredientData.name,
      category: ingredientData.category || 'other',
      quantity: ingredientData.quantity?.toString() || '1',
      unit: ingredientData.unit || 'pcs',
      addedDate: addedDate,
      shelfLifeDays: shelfLifeDays,
      expirationDate: this.computeExpiration(addedDate, shelfLifeDays),
      source: ingredientData.source || 'my_ingredients'
    };

    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
        return await supabase
          .from('ingredients')
          .insert([{
            id: newId,
            name: formatted.name,
            category: formatted.category,
            quantity: parseFloat(formatted.quantity),
            unit: formatted.unit,
            added_date: formatted.addedDate,
            shelf_life_days: parseInt(formatted.shelfLifeDays),
            source: formatted.source,
          }])
          .select()
          .single();
      }, 'Create ingredient');

      if (result.success) {
        const local = await this.getLocalIngredients();
        local.unshift(formatted);
        await saveData(StorageKeys.INGREDIENTS, local);
        return result;
      }
    }

    const local = await this.getLocalIngredients();
    local.unshift(formatted);
    await saveData(StorageKeys.INGREDIENTS, local);

    return {
      success: true,
      data: this.transformToSupabaseFormat(formatted),
      error: null
    };
  }

  /**
   * Update an existing ingredient
   */
  static async updateIngredient(id, updates) {
    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
        const updateData = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.category) updateData.category = updates.category;
        if (updates.quantity !== undefined) updateData.quantity = parseFloat(updates.quantity);
        if (updates.unit) updateData.unit = updates.unit;
        if (updates.shelfLifeDays !== undefined) updateData.shelf_life_days = parseInt(updates.shelfLifeDays);
        if (updates.addedDate) updateData.added_date = updates.addedDate;

        return await supabase
          .from('ingredients')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
      }, `Update ingredient ${id}`);

      if (result.success) {
        const local = await this.getLocalIngredients();
        const idx = local.findIndex(i => i.id === id);
        if (idx !== -1) {
          local[idx] = {
            ...local[idx],
            ...updates,
            expirationDate: this.computeExpiration(
              updates.addedDate || local[idx].addedDate,
              updates.shelfLifeDays || local[idx].shelfLifeDays
            )
          };
          await saveData(StorageKeys.INGREDIENTS, local);
        }
        return result;
      }
    }

    const local = await this.getLocalIngredients();
    const idx = local.findIndex(i => i.id === id);
    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        ...updates,
        expirationDate: this.computeExpiration(
          updates.addedDate || local[idx].addedDate,
          updates.shelfLifeDays || local[idx].shelfLifeDays
        )
      };
      await saveData(StorageKeys.INGREDIENTS, local);
      return {
        success: true,
        data: this.transformToSupabaseFormat(local[idx]),
        error: null
      };
    }

    return { success: false, data: null, error: 'Ingredient not found' };
  }

  /**
   * Delete an ingredient
   */
  static async deleteIngredient(id) {
    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
        return await supabase
          .from('ingredients')
          .delete()
          .eq('id', id);
      }, `Delete ingredient ${id}`);

      if (result.success) {
        const local = await this.getLocalIngredients();
        const filtered = local.filter(i => i.id !== id);
        await saveData(StorageKeys.INGREDIENTS, filtered);
        return result;
      }
    }

    const local = await this.getLocalIngredients();
    const filtered = local.filter(i => i.id !== id);
    await saveData(StorageKeys.INGREDIENTS, filtered);
    return { success: true, data: null, error: null };
  }

  static sortIngredients(ingredients, sortBy = 'name') {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    const sorted = [...ingredients];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'quantity':
        return sorted.sort((a, b) => parseFloat(b.quantity || 0) - parseFloat(a.quantity || 0));
      case 'expiration':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.expiration_date || a.expirationDate || 0);
          const dateB = new Date(b.expiration_date || b.expirationDate || 0);
          return dateA - dateB;
        });
      default:
        return sorted;
    }
  }

  static filterIngredients(ingredients, filters = {}) {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    let filtered = [...ingredients];
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(ing =>
        ing.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(ing =>
        ing.name?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }

  /**
   * Helper formatting
   */
  static transformToSupabaseFormat(ing) {
    if (!ing) return null;
    return {
      id: ing.id,
      name: ing.name,
      category: ing.category,
      quantity: parseFloat(ing.quantity || 0),
      unit: ing.unit,
      added_date: ing.addedDate,
      shelf_life_days: parseInt(ing.shelfLifeDays || 7),
      expiration_date: ing.expirationDate || this.computeExpiration(ing.addedDate, ing.shelfLifeDays),
      source: ing.source
    };
  }

  static transformArrayToSupabaseFormat(arr) {
    if (!arr) return [];
    return arr.map(i => this.transformToSupabaseFormat(i));
  }

  static transformToFrontend(supabaseIngredient) {
    if (!supabaseIngredient) return null;
    return {
      id: supabaseIngredient.id,
      name: supabaseIngredient.name,
      category: supabaseIngredient.category,
      quantity: supabaseIngredient.quantity?.toString() || '0',
      unit: supabaseIngredient.unit,
      addedDate: supabaseIngredient.added_date || supabaseIngredient.addedDate,
      shelfLifeDays: (supabaseIngredient.shelf_life_days || supabaseIngredient.shelfLifeDays || '7').toString(),
      expirationDate: supabaseIngredient.expiration_date || supabaseIngredient.expirationDate,
      source: supabaseIngredient.source || 'my_ingredients',
    };
  }

  static transformArrayToFrontend(ingredients) {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    return ingredients.map(ing => this.transformToFrontend(ing));
  }
}

export default IngredientService;
