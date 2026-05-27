/**
 * AI Service
 * Calls a server-side proxy (/api/gemini) so the Gemini API key never ships
 * in the client bundle. The proxy holds GEMINI_API_KEY as a Vercel
 * environment variable and forwards requests to Google.
 */

const API_BASE = import.meta.env.VITE_API_BASE || '';
const PROXY_URL = `${API_BASE}/api/gemini`;

async function callGemini(payload) {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || errorData.error || `Proxy request failed with status ${response.status}`
    );
  }

  return response.json();
}

export class AiService {
  static isConfigured() {
    return true;
  }

  static async chat(userMessage, chatHistory = [], context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);

      const contents = [];

      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I am your cooking assistant. I have access to your ingredient inventory and recipe library. How can I help you today?' }],
      });

      chatHistory.forEach(msg => {
        contents.push({
          role: msg.isBot ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      });

      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const data = await callGemini({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

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
      console.error('Gemini proxy error:', error);
      return {
        success: false,
        text: null,
        error: error.message || 'Failed to communicate with AI',
      };
    }
  }

  /**
   * Generate a single dish suggestion for a specific meal type based on available ingredients.
   * Used by the RecommendedMenuScreen to fill gaps when no existing recipe matches.
   */
  static async generateDishSuggestion(ingredients, mealType) {
    try {
      const ingredientList = ingredients
        .map(i => `${i.name} (${i.quantity} ${i.unit})`)
        .join(', ');

      const mealLabel = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[mealType] || mealType;

      const prompt = `你是一位专业厨师。根据以下现有食材，推荐一道适合${mealLabel}的菜肴。

现有食材：${ingredientList}

要求：
- 必须是适合${mealLabel}的菜品
- 尽量只使用上述食材（可默认盐、酱油、食用油等基础调料可用）
- 给出合理的烹饪时间和难度

你必须严格按照以下 JSON 格式回复，不要包含任何其他文字：
{
  "name": "菜品名称",
  "mealType": "${mealType}",
  "difficulty": "easy/medium/hard",
  "time": 30,
  "ingredients": [
    { "name": "食材名", "property": "类别如meat/vegetable/dairy/seasoning/grain/fruit/oil/protein/pasta", "quantity": "数量", "unit": "单位如g/个/勺/毫升/杯" }
  ],
  "steps": [
    "步骤1",
    "步骤2"
  ]
}

提供 4-8 种食材和 4-8 个详细烹饪步骤。只回复 JSON 对象。`;

      const data = await callGemini({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content?.parts?.[0]?.text;
        if (text) {
          let jsonStr = text.trim();
          if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          }
          const dish = JSON.parse(jsonStr);
          return { success: true, dish, error: null };
        }
      }

      return { success: false, dish: null, error: 'AI 未返回有效菜品' };
    } catch (error) {
      console.error('Dish suggestion error:', error);
      return {
        success: false,
        dish: null,
        error: error.message || 'Failed to generate dish suggestion',
      };
    }
  }

  static async generateRecipe(dishName, mealType, difficulty, time) {
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

      const data = await callGemini({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content?.parts?.[0]?.text;
        if (text) {
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

  static parseRecipeFromChat(text, recipeName) {
    try {
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
