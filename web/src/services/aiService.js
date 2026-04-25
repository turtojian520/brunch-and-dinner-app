import { GEMINI_API_KEY } from '@env';

/**
 * AI Service
 * Handles all Google AI Studio (Gemini) API interactions
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export class AiService {
  /**
   * Check if Gemini API is configured
   * @returns {boolean}
   */
  static isConfigured() {
    return Boolean(GEMINI_API_KEY);
  }

  /**
   * Send a message to Gemini API
   * @param {string} userMessage - The user's message
   * @param {Array} chatHistory - Previous messages for context
   * @param {Object} context - App context (ingredients, recipes)
   * @returns {Promise<Object>} { success, text, error }
   */
  static async chat(userMessage, chatHistory = [], context = {}) {
    if (!this.isConfigured()) {
      return {
        success: false,
        text: null,
        error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.',
      };
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);

      // Build contents array with history
      const contents = [];

      // Add system instruction as first user turn
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I am your cooking assistant. I have access to your ingredient inventory and recipe library. How can I help you today?' }],
      });

      // Add chat history
      chatHistory.forEach(msg => {
        contents.push({
          role: msg.isBot ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      });

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content?.parts?.[0]?.text;
        if (text) {
          return { success: true, text, error: null };
        }
      }

      return {
        success: false,
        text: null,
        error: 'No response generated from AI',
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        text: null,
        error: error.message || 'Failed to communicate with AI',
      };
    }
  }

  /**
   * Generate recipe details from a dish name using AI
   * @param {string} dishName - Name of the dish
   * @param {string} mealType - breakfast, lunch, or dinner
   * @param {string} difficulty - easy, medium, or difficult
   * @param {number} time - cooking time in minutes
   * @returns {Promise<Object>} { success, recipe, error }
   */
  static async generateRecipe(dishName, mealType, difficulty, time) {
    if (!this.isConfigured()) {
      return {
        success: false,
        recipe: null,
        error: 'Gemini API key not configured.',
      };
    }

    try {
      const prompt = `You are a professional chef. Generate a complete recipe for "${dishName}".

Requirements:
- Meal type: ${mealType}
- Difficulty: ${difficulty}
- Approximate cooking time: ${time} minutes

You MUST respond in the following JSON format ONLY, with no additional text before or after:
{
  "ingredients": [
    { "name": "Ingredient Name", "property": "category like meat/vegetable/dairy/seasoning/grain/fruit/oil/protein/pasta", "quantity": "number", "unit": "unit like g/pcs/tbsp/tsp/ml/cup" }
  ],
  "steps": [
    "Step 1 description",
    "Step 2 description"
  ]
}

Provide 4-8 ingredients and 4-8 detailed cooking steps. Use common, accessible ingredients. Respond ONLY with the JSON object.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content?.parts?.[0]?.text;
        if (text) {
          // Parse JSON from response, handling potential markdown code blocks
          let jsonStr = text.trim();
          if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          }

          const recipe = JSON.parse(jsonStr);
          return { success: true, recipe, error: null };
        }
      }

      return {
        success: false,
        recipe: null,
        error: 'No recipe generated from AI',
      };
    } catch (error) {
      console.error('Recipe generation error:', error);
      return {
        success: false,
        recipe: null,
        error: error.message || 'Failed to generate recipe',
      };
    }
  }

  /**
   * Build system prompt with app context
   * @param {Object} context - { ingredients, recipes }
   * @returns {string} System prompt
   */
  static buildSystemPrompt(context) {
    let prompt = `You are a professional cooking assistant integrated into a meal planning app called "WhatToEat". 
You help users with recipe recommendations, cooking techniques, ingredient substitutions, and meal planning.
Keep your responses concise, friendly, and practical. Use bullet points for lists.
If the user asks you to recommend a recipe, format it clearly with ingredients and steps.
When you suggest a recipe that the user might want to save, mention they can add it to their recipe library.

IMPORTANT: If the user provides a recipe or asks you to generate one, and they want to save it, 
format the recipe in a structured way with clear sections for ingredients and steps.`;

    if (context.ingredients && context.ingredients.length > 0) {
      const ingredientList = context.ingredients
        .map(i => `${i.name} (${i.quantity} ${i.unit}, expires: ${i.expirationDate || 'N/A'})`)
        .join(', ');
      prompt += `\n\nThe user currently has these ingredients in their inventory: ${ingredientList}`;
    }

    if (context.recipes && context.recipes.length > 0) {
      const recipeList = context.recipes
        .map(r => `${r.name} (${r.mealType}, ${r.difficulty}, ${r.time} mins)`)
        .join(', ');
      prompt += `\n\nThe user's recipe library contains: ${recipeList}`;
    }

    return prompt;
  }

  /**
   * Parse a recipe from AI chat response text
   * Attempts to extract structured recipe data from free-form text
   * @param {string} text - AI response text
   * @param {string} recipeName - Expected recipe name
   * @returns {Object|null} Parsed recipe or null
   */
  static parseRecipeFromChat(text, recipeName) {
    try {
      // Try to find JSON block in the text
      const jsonMatch = text.match(/\{[\s\S]*"ingredients"[\s\S]*"steps"[\s\S]*\}/);
      if (jsonMatch) {
        const recipe = JSON.parse(jsonMatch[0]);
        return {
          name: recipeName,
          ingredients: recipe.ingredients || [],
          steps: recipe.steps || [],
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}

export default AiService;
