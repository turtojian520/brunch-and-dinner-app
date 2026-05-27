import { SupabaseService } from './supabaseService';
import { supabase } from '../config/supabase';
import { getData, saveData, StorageKeys } from '../utils/storage';
import { RecipeService } from './recipeService';

export class MenuCalendarService {
  /**
   * Helper to load calendar from local storage
   * format: { [dateStr]: [ { id, name, mealType, ... } ] }
   */
  static async getLocalCalendar() {
    const calendar = await getData(StorageKeys.MENU_CALENDAR);
    return calendar || {};
  }

  /**
   * Get menu entries for a specific date
   */
  static async getMenuByDate(date) {
    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
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

      if (result.success && result.data) {
        return result;
      }
    }

    // Local lookup
    const local = await this.getLocalCalendar();
    const list = local[date] || [];
    
    // Transform local list to mock supabase rows
    const mockRows = list.map(item => ({
      id: item.id || crypto.randomUUID(),
      date: date,
      meal_type: item.mealType,
      recipes: RecipeService.transformToSupabaseFormat(item)
    }));

    return {
      success: true,
      data: mockRows,
      error: null
    };
  }

  /**
   * Get menu entries for a date range
   */
  static async getMenuByDateRange(startDate, endDate) {
    if (SupabaseService.isConfigured()) {
      return await SupabaseService.execute(async () => {
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

    const local = await this.getLocalCalendar();
    const rows = [];
    
    // Scan local calendar
    Object.keys(local).forEach(date => {
      if (date >= startDate && date <= endDate) {
        local[date].forEach(item => {
          rows.push({
            id: item.id || crypto.randomUUID(),
            date: date,
            meal_type: item.mealType,
            recipes: RecipeService.transformToSupabaseFormat(item)
          });
        });
      }
    });

    return {
      success: true,
      data: rows,
      error: null
    };
  }

  /**
   * Get all marked dates (dates with planned meals)
   */
  static async getMarkedDates() {
    if (SupabaseService.isConfigured()) {
      const response = await supabase
        .from('menu_calendar')
        .select('date')
        .order('date', { ascending: true });

      if (!response.error) {
        const markedDates = {};
        const uniqueDates = [...new Set(response.data.map(item => item.date))];
        uniqueDates.forEach(date => {
          markedDates[date] = { marked: true, dotColor: '#FF6B6B' };
        });
        return { data: markedDates, error: null };
      }
    }

    const local = await this.getLocalCalendar();
    const markedDates = {};
    Object.keys(local).forEach(date => {
      if (local[date] && local[date].length > 0) {
        markedDates[date] = { marked: true, dotColor: '#FF5F5F' };
      }
    });

    return {
      success: true,
      data: markedDates,
      error: null
    };
  }

  /**
   * Add a recipe to the menu calendar
   */
  static async addRecipeToMenu(date, recipeId, mealType) {
    // Resolve recipe detail first
    const recipeResult = await RecipeService.getRecipeById(recipeId);
    if (!recipeResult.success || !recipeResult.data) {
      return { success: false, data: null, error: 'Recipe not found' };
    }
    const recipe = RecipeService.transformToFrontend(recipeResult.data);

    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
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

      if (result.success) {
        // Sync local cache
        const local = await this.getLocalCalendar();
        if (!local[date]) local[date] = [];
        local[date].push({ ...recipe, id: recipeId, mealType });
        await saveData(StorageKeys.MENU_CALENDAR, local);
        return result;
      }
    }

    // Local save
    const local = await this.getLocalCalendar();
    if (!local[date]) local[date] = [];
    local[date].push({ ...recipe, id: recipeId, mealType });
    await saveData(StorageKeys.MENU_CALENDAR, local);

    return {
      success: true,
      data: {
        id: crypto.randomUUID(),
        date: date,
        meal_type: mealType,
        recipes: RecipeService.transformToSupabaseFormat(recipe)
      },
      error: null
    };
  }

  /**
   * Add multiple recipes to menu calendar
   */
  static async addMultipleRecipesToMenu(entries) {
    const results = [];
    for (const entry of entries) {
      const r = await this.addRecipeToMenu(entry.date, entry.recipeId || entry.recipe_id, entry.mealType || entry.meal_type);
      if (r.success) {
        results.push(r.data);
      }
    }
    return {
      success: results.length > 0,
      data: results,
      error: results.length > 0 ? null : 'Failed to add recipes'
    };
  }

  /**
   * Remove recipe from menu by date and recipe ID
   */
  static async removeRecipeByDateAndId(date, recipeId) {
    if (SupabaseService.isConfigured()) {
      const result = await SupabaseService.execute(async () => {
        return await supabase
          .from('menu_calendar')
          .delete()
          .eq('date', date)
          .eq('recipe_id', recipeId);
      }, `Remove recipe from menu on ${date}`);

      if (result.success) {
        const local = await this.getLocalCalendar();
        if (local[date]) {
          local[date] = local[date].filter(r => r.id !== recipeId);
          if (local[date].length === 0) delete local[date];
          await saveData(StorageKeys.MENU_CALENDAR, local);
        }
        return result;
      }
    }

    const local = await this.getLocalCalendar();
    if (local[date]) {
      local[date] = local[date].filter(r => r.id !== recipeId);
      if (local[date].length === 0) delete local[date];
      await saveData(StorageKeys.MENU_CALENDAR, local);
    }
    return { success: true, data: null, error: null };
  }

  /**
   * Get recipes grouped by meal type for a specific date
   */
  static async getGroupedMenuByDate(date) {
    const result = await this.getMenuByDate(date);
    if (!result.success || !result.data) {
      return result;
    }

    const grouped = {
      breakfast: [],
      lunch: [],
      dinner: [],
    };

    result.data.forEach(entry => {
      const mealType = entry.meal_type;
      const recipeData = entry.recipes;
      if (grouped[mealType] && recipeData) {
        grouped[mealType].push(RecipeService.transformToFrontend(recipeData));
      }
    });

    return {
      success: true,
      data: grouped,
      error: null,
    };
  }
}

export default MenuCalendarService;
