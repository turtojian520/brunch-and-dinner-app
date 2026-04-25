import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeService } from '../services/recipeService';
import { IngredientService } from '../services/ingredientService';
import { MenuCalendarService } from '../services/menuCalendarService';
import { isSupabaseConfigured } from '../config/supabase';
import { mockRecipes } from '../data/mockRecipes';

const MIGRATION_KEY = '@migration_completed';
const STORAGE_KEYS = {
  RECIPES: '@recipes',
  INGREDIENTS: '@ingredients',
  MENU_CALENDAR: '@menu_calendar',
};

/**
 * Data Migration Utility
 * Handles one-time migration from AsyncStorage to Supabase
 */

export class DataMigration {
  /**
   * Check if migration has already been completed
   * @returns {Promise<boolean>}
   */
  static async isMigrationCompleted() {
    try {
      const completed = await AsyncStorage.getItem(MIGRATION_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Mark migration as completed
   * @returns {Promise<void>}
   */
  static async markMigrationCompleted() {
    try {
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
    } catch (error) {
      console.error('Error marking migration completed:', error);
    }
  }

  /**
   * Initialize Supabase with mock recipes if empty
   * @returns {Promise<Object>} { success, message }
   */
  static async initializeWithMockData() {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase not configured' };
    }

    try {
      // Check if recipes already exist
      const result = await RecipeService.getAllRecipes();

      if (result.success && result.data && result.data.length > 0) {
        return { success: true, message: 'Recipes already exist' };
      }

      // Insert mock recipes
      console.log('Initializing database with mock recipes...');
      let successCount = 0;
      let failCount = 0;

      for (const recipe of mockRecipes) {
        const createResult = await RecipeService.createRecipe(recipe);
        if (createResult.success) {
          successCount++;
        } else {
          failCount++;
          console.error('Failed to create recipe:', recipe.name, createResult.error);
        }
      }

      return {
        success: successCount > 0,
        message: `Initialized with ${successCount} recipes (${failCount} failed)`,
      };
    } catch (error) {
      console.error('Error initializing mock data:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Migrate recipes from AsyncStorage to Supabase
   * @returns {Promise<Object>} { success, count, message }
   */
  static async migrateRecipes() {
    try {
      const recipesJson = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);

      if (!recipesJson) {
        return { success: true, count: 0, message: 'No recipes to migrate' };
      }

      const recipes = JSON.parse(recipesJson);

      if (!Array.isArray(recipes) || recipes.length === 0) {
        return { success: true, count: 0, message: 'No recipes to migrate' };
      }

      console.log(`Migrating ${recipes.length} recipes...`);
      let successCount = 0;
      let failCount = 0;

      for (const recipe of recipes) {
        const result = await RecipeService.createRecipe(recipe);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error('Failed to migrate recipe:', recipe.name, result.error);
        }
      }

      return {
        success: successCount > 0,
        count: successCount,
        message: `Migrated ${successCount} recipes (${failCount} failed)`,
      };
    } catch (error) {
      console.error('Error migrating recipes:', error);
      return { success: false, count: 0, message: error.message };
    }
  }

  /**
   * Migrate ingredients from AsyncStorage to Supabase
   * @returns {Promise<Object>} { success, count, message }
   */
  static async migrateIngredients() {
    try {
      const ingredientsJson = await AsyncStorage.getItem(STORAGE_KEYS.INGREDIENTS);

      if (!ingredientsJson) {
        return { success: true, count: 0, message: 'No ingredients to migrate' };
      }

      const ingredients = JSON.parse(ingredientsJson);

      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return { success: true, count: 0, message: 'No ingredients to migrate' };
      }

      console.log(`Migrating ${ingredients.length} ingredients...`);
      let successCount = 0;
      let failCount = 0;

      for (const ingredient of ingredients) {
        const result = await IngredientService.createIngredient(ingredient);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error('Failed to migrate ingredient:', ingredient.name, result.error);
        }
      }

      return {
        success: successCount > 0,
        count: successCount,
        message: `Migrated ${successCount} ingredients (${failCount} failed)`,
      };
    } catch (error) {
      console.error('Error migrating ingredients:', error);
      return { success: false, count: 0, message: error.message };
    }
  }

  /**
   * Migrate menu calendar from AsyncStorage to Supabase
   * @returns {Promise<Object>} { success, count, message }
   */
  static async migrateMenuCalendar() {
    try {
      const calendarJson = await AsyncStorage.getItem(STORAGE_KEYS.MENU_CALENDAR);

      if (!calendarJson) {
        return { success: true, count: 0, message: 'No menu calendar to migrate' };
      }

      const calendar = JSON.parse(calendarJson);

      if (!calendar || typeof calendar !== 'object') {
        return { success: true, count: 0, message: 'No menu calendar to migrate' };
      }

      console.log('Migrating menu calendar...');
      const entries = [];

      // Convert calendar object to entries array
      Object.keys(calendar).forEach(date => {
        const recipes = calendar[date];
        if (Array.isArray(recipes)) {
          recipes.forEach(recipe => {
            entries.push({
              date: date,
              recipeId: recipe.id,
              mealType: recipe.mealType,
            });
          });
        }
      });

      if (entries.length === 0) {
        return { success: true, count: 0, message: 'No menu entries to migrate' };
      }

      const result = await MenuCalendarService.addMultipleRecipesToMenu(entries);

      if (result.success) {
        return {
          success: true,
          count: entries.length,
          message: `Migrated ${entries.length} menu entries`,
        };
      } else {
        return {
          success: false,
          count: 0,
          message: result.error || 'Failed to migrate menu calendar',
        };
      }
    } catch (error) {
      console.error('Error migrating menu calendar:', error);
      return { success: false, count: 0, message: error.message };
    }
  }

  /**
   * Perform full migration from AsyncStorage to Supabase
   * @param {Function} onProgress - Optional callback for progress updates
   * @returns {Promise<Object>} { success, results, message }
   */
  static async migrateAll(onProgress = null) {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase not configured. Please set up .env file.',
      };
    }

    const migrationCompleted = await this.isMigrationCompleted();

    if (migrationCompleted) {
      return {
        success: true,
        message: 'Migration already completed',
        alreadyMigrated: true,
      };
    }

    const results = {
      recipes: null,
      ingredients: null,
      menuCalendar: null,
      mockData: null,
    };

    try {
      // Check if Supabase is empty and initialize with mock data if needed
      onProgress?.('Checking database...');
      results.mockData = await this.initializeWithMockData();

      // Migrate recipes
      onProgress?.('Migrating recipes...');
      results.recipes = await this.migrateRecipes();

      // Migrate ingredients
      onProgress?.('Migrating ingredients...');
      results.ingredients = await this.migrateIngredients();

      // Migrate menu calendar
      onProgress?.('Migrating menu calendar...');
      results.menuCalendar = await this.migrateMenuCalendar();

      // Mark migration as completed
      await this.markMigrationCompleted();

      const totalMigrated =
        (results.recipes?.count || 0) +
        (results.ingredients?.count || 0) +
        (results.menuCalendar?.count || 0);

      return {
        success: true,
        results: results,
        message: `Migration completed! Migrated ${totalMigrated} items.`,
      };
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        results: results,
        message: `Migration failed: ${error.message}`,
      };
    }
  }

  /**
   * Clear local AsyncStorage data after successful migration
   * @returns {Promise<void>}
   */
  static async clearLocalData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.RECIPES,
        STORAGE_KEYS.INGREDIENTS,
        STORAGE_KEYS.MENU_CALENDAR,
      ]);
      console.log('Local data cleared');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  /**
   * Reset migration flag (for testing purposes)
   * @returns {Promise<void>}
   */
  static async resetMigrationFlag() {
    try {
      await AsyncStorage.removeItem(MIGRATION_KEY);
      console.log('Migration flag reset');
    } catch (error) {
      console.error('Error resetting migration flag:', error);
    }
  }
}

export default DataMigration;
