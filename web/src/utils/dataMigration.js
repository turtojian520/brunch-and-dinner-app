import { RecipeService } from '../services/recipeService';
import { isSupabaseConfigured } from '../config/supabase';
import { mockRecipes } from '../data/mockRecipes';

/**
 * Data Migration & Seeding Utility
 */
export class DataMigration {
  static async isMigrationCompleted() {
    return true;
  }

  static async markMigrationCompleted() {}

  static async initializeWithMockData() {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase not configured' };
    }

    try {
      // Check if recipes already exist in DB
      const result = await RecipeService.getAllRecipes();

      if (result.success && result.data && result.data.length > 0) {
        return { success: true, message: 'Recipes already exist' };
      }

      console.log('Initializing Supabase with mock recipes...');
      let successCount = 0;
      let failCount = 0;

      for (const recipe of mockRecipes) {
        const createResult = await RecipeService.createRecipe(recipe);
        if (createResult.success) {
          successCount++;
        } else {
          failCount++;
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

  static async migrateAll() {
    return { success: true, message: 'All systems ready offline-first' };
  }
  
  static async clearLocalData() {}
}

export default DataMigration;
