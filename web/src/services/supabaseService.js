import { supabase, isSupabaseConfigured } from '../config/supabase';

/**
 * Base Supabase Service
 * Provides common error handling and utility functions for all services
 */
export class SupabaseService {
  /**
   * Handle Supabase response and errors
   */
  static handleResponse(response, operation = 'Operation') {
    const { data, error } = response;

    if (error) {
      console.error(`${operation} failed:`, error);
      return {
        success: false,
        data: null,
        error: error.message || `${operation} failed`,
      };
    }

    return {
      success: true,
      data: data,
      error: null,
    };
  }

  /**
   * Check if Supabase is properly configured
   */
  static isConfigured() {
    return isSupabaseConfigured();
  }

  /**
   * Get Supabase client instance
   */
  static getClient() {
    return supabase;
  }

  /**
   * Execute a database operation with error handling
   */
  static async execute(operation, operationName = 'Database operation') {
    try {
      if (!this.isConfigured()) {
        console.warn('Supabase not configured, operation skipped:', operationName);
        return {
          success: false,
          data: null,
          error: 'Supabase not configured. Please set up your .env file.',
        };
      }

      const response = await operation();
      return this.handleResponse(response, operationName);
    } catch (error) {
      console.error(`${operationName} exception:`, error);
      return {
        success: false,
        data: null,
        error: error.message || `${operationName} failed`,
      };
    }
  }
}

export default SupabaseService;
