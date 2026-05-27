import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar as CalendarIcon, RefreshCw, Clock, Flame, Check, X, Bot, BookOpen } from 'lucide-react';
import { RecipeService } from '../services/recipeService';
import { IngredientService } from '../services/ingredientService';
import { AiService } from '../services/aiService';
import { MenuCalendarService } from '../services/menuCalendarService';
import { showAlert } from '../utils/alert';

/**
 * Check whether every ingredient required by `recipe` exists in the user's
 * inventory (case-insensitive name match). Returns true only when the recipe
 * is fully "ready to cook".
 */
function isRecipeReady(recipe, inventory) {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return false;
  return recipe.ingredients.every(ri =>
    inventory.some(
      inv =>
        inv.name.toLowerCase().trim() === ri.name.toLowerCase().trim()
    )
  );
}

/**
 * For a given meal type, pick the first recipe from the library whose
 * ingredients are all in stock. Returns `null` when nothing qualifies.
 */
function findReadyRecipe(mealType, recipes, inventory) {
  const candidates = recipes.filter(r => r.mealType === mealType);
  // Shuffle so we don't always pick the same one
  const shuffled = candidates.sort(() => 0.5 - Math.random());
  return shuffled.find(r => isRecipeReady(r, inventory)) || null;
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

export default function RecommendedMenuScreen({ onNavigate }) {
  const [dishes, setDishes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAndGenerate();
  }, []);

  /**
   * Core logic:
   * 1. Load ingredients (inventory) and recipes in parallel.
   * 2. For each meal type, check if an existing recipe is "ready" (all
   *    ingredients in stock). Use it directly if so.
   * 3. For meal types with no ready recipe, call the LLM to generate one.
   * 4. Combine results and display.
   */
  const loadAndGenerate = async () => {
    try {
      setLoading(true);
      setStatusText('正在检查你的厨房库存…');

      // 1. Load data in parallel
      const [ingredientsResult, recipesResult] = await Promise.all([
        IngredientService.getAllIngredients(),
        RecipeService.getAllRecipes(),
      ]);

      const inventory = ingredientsResult.success
        ? IngredientService.transformArrayToFrontend(ingredientsResult.data)
        : [];

      const allRecipes = recipesResult.success && recipesResult.data
        ? RecipeService.transformArrayToFrontend(recipesResult.data)
        : [];

      if (inventory.length === 0) {
        showAlert('提示', '你的食材库为空，请先添加一些食材再来规划菜单。');
        setDishes([]);
        setLoading(false);
        return;
      }

      // 2. For each meal type, try to find a ready recipe
      const resolved = [];   // { dish, source: 'library' | 'ai' }
      const missingTypes = [];

      for (const mt of MEAL_TYPES) {
        const ready = findReadyRecipe(mt, allRecipes, inventory);
        if (ready) {
          resolved.push({ dish: ready, source: 'library' });
        } else {
          missingTypes.push(mt);
        }
      }

      // 3. Generate missing dishes via LLM (parallel)
      if (missingTypes.length > 0) {
        setStatusText(`AI 正在为 ${missingTypes.map(t => ({ breakfast: '早餐', lunch: '午餐', dinner: '晚餐' })[t]).join('、')} 生成菜谱…`);

        const llmResults = await Promise.allSettled(
          missingTypes.map(mt => AiService.generateDishSuggestion(inventory, mt))
        );

        llmResults.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value.success) {
            const dish = result.value.dish;
            // Assign a temporary ID so the UI can track selection
            dish.id = dish.id || `ai-${missingTypes[idx]}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            dish.mealType = dish.mealType || missingTypes[idx];
            resolved.push({ dish, source: 'ai' });
          } else {
            console.error(`LLM generation failed for ${missingTypes[idx]}:`, result.reason || result.value?.error);
          }
        });
      }

      setDishes(resolved);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      showAlert('错误', '生成菜单时出错，请稍后重试。');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddClick = () => {
    if (selectedIds.length === 0) {
      showAlert('提示', '请先选择至少一道菜。');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setDateModalVisible(true);
  };

  const confirmAddToCalendar = async () => {
    if (!selectedDate) {
      showAlert('错误', '请选择日期。');
      return;
    }

    try {
      setSubmitting(true);
      const selectedDishes = dishes.filter(d => selectedIds.includes(d.dish.id));
      const entries = [];

      for (const { dish, source } of selectedDishes) {
        let recipeId = dish.id;

        if (source === 'ai') {
          // AI-generated dish → create recipe in DB first
          const createResult = await RecipeService.createRecipe({
            name: dish.name,
            mealType: dish.mealType,
            difficulty: dish.difficulty || 'medium',
            time: dish.time || 30,
            ingredients: dish.ingredients || [],
            steps: dish.steps || [],
          });

          if (createResult.success && createResult.data) {
            const created = RecipeService.transformToFrontend(createResult.data);
            recipeId = created.id;
          } else {
            console.error('Failed to create AI recipe:', createResult.error);
            continue;
          }
        }

        entries.push({
          date: selectedDate,
          recipeId,
          mealType: dish.mealType || 'lunch',
        });
      }

      if (entries.length === 0) {
        showAlert('错误', '没有可添加的菜品。');
        return;
      }

      const result = await MenuCalendarService.addMultipleRecipesToMenu(entries);
      if (result.success) {
        showAlert('添加成功', `已为 ${selectedDate} 规划了 ${entries.length} 道菜！`);
        setDateModalVisible(false);
        setSelectedIds([]);
      } else {
        showAlert('错误', result.error || '添加失败。');
      }
    } catch (err) {
      console.error(err);
      showAlert('错误', '添加时发生错误。');
    } finally {
      setSubmitting(false);
    }
  };

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const label = i === 0 ? '今天' : i === 1 ? '明天' : dateStr;
      dates.push({ value: dateStr, label });
    }
    return dates;
  };

  const getMealTypeBadge = (mealType) => {
    switch (mealType) {
      case 'breakfast': return { cls: 'bg-amber-100 text-amber-700', label: '早餐' };
      case 'lunch':     return { cls: 'bg-teal-100 text-teal-700',   label: '午餐' };
      case 'dinner':    return { cls: 'bg-rose-100 text-rose-700',   label: '晚餐' };
      default:          return { cls: 'bg-gray-100 text-gray-700',   label: mealType };
    }
  };

  const getSourceBadge = (source) => {
    if (source === 'library') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
          <BookOpen size={10} />
          菜谱库
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] font-bold uppercase tracking-wider">
        <Bot size={10} />
        AI 推荐
      </span>
    );
  };

  return (
    <div className="space-y-8 select-none py-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-3xl tracking-tight text-brand-charcoal">
            今日菜单规划
          </h2>
          <p className="font-body text-sm font-semibold text-[#A2A292] mt-1">
            根据你的食材库存，智能推荐早午晚餐。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAndGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-[#F2EFE6] hover:bg-[#EBEBE2] text-brand-charcoal rounded-brand font-body font-bold text-sm transition-all active:scale-95 border border-[#EBEBE2]"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>重新生成</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Sparkles size={40} className="animate-pulse text-brand-primary mb-4" />
          <p className="font-body font-bold text-[#A2A292]">{statusText || '正在准备…'}</p>
        </div>
      ) : dishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-[#EBEBE2] rounded-brand p-12 text-center shadow-premium">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="font-headline font-bold text-lg text-brand-charcoal">暂无推荐</h3>
          <p className="font-body text-sm text-[#A2A292] mt-2 max-w-sm">
            请先在食材库中添加食材，或在菜谱库中添加菜谱。
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onNavigate('ingredients')}
              className="px-6 py-3 bg-brand-primary text-white font-body font-bold rounded-brand text-sm shadow-md"
            >
              去添加食材
            </button>
            <button
              onClick={() => onNavigate('recipes')}
              className="px-6 py-3 bg-[#F2EFE6] text-brand-charcoal font-body font-bold rounded-brand text-sm border border-[#EBEBE2]"
            >
              去菜谱库
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Card Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dishes.map(({ dish, source }) => {
              const isSelected = selectedIds.includes(dish.id);
              const mealBadge = getMealTypeBadge(dish.mealType);

              return (
                <div
                  key={dish.id}
                  onClick={() => toggleSelect(dish.id)}
                  className={`group relative flex flex-col p-6 bg-white border rounded-brand cursor-pointer transition-all duration-300 shadow-premium hover:shadow-premium-hover ${
                    isSelected ? 'border-brand-primary bg-brand-primary/[0.02]' : 'border-[#EBEBE2]'
                  }`}
                >
                  {/* Badges Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-full font-label font-bold text-[10px] uppercase tracking-wider ${mealBadge.cls}`}>
                        {mealBadge.label}
                      </span>
                      {getSourceBadge(source)}
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-[#A2A292] text-transparent'
                    }`}>
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  </div>

                  {/* Dish Name */}
                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      if (source === 'library') {
                        onNavigate('recipe-detail', dish);
                      }
                    }}
                    className={`font-headline font-extrabold text-xl text-brand-charcoal group-hover:text-brand-primary transition-colors line-clamp-1 mb-3 ${
                      source === 'library' ? 'cursor-pointer' : ''
                    }`}
                  >
                    {dish.name}
                  </h3>

                  {/* AI dish description */}
                  {source === 'ai' && dish.steps && dish.steps.length > 0 && (
                    <p className="font-body text-xs text-[#9E9E8E] line-clamp-2 mb-3 leading-relaxed">
                      {dish.steps[0]}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-auto">
                    {dish.time && (
                      <div className="flex items-center gap-1.5 text-xs text-[#9E9E8E] font-body font-bold">
                        <Clock size={14} className="text-[#A2A292]" />
                        <span>{dish.time} 分钟</span>
                      </div>
                    )}
                    {dish.difficulty && (
                      <div className="flex items-center gap-1.5 text-xs text-[#9E9E8E] font-body font-bold">
                        <Flame size={14} className="text-[#A2A292]" />
                        <span className="capitalize">
                          {dish.difficulty === 'easy' ? '简单' : dish.difficulty === 'medium' ? '中等' : '困难'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Plan Bar */}
          <div className="flex justify-end pt-4 border-t border-[#EBEBE2]">
            <button
              onClick={handleAddClick}
              disabled={selectedIds.length === 0}
              className={`flex items-center gap-2.5 px-8 py-4 rounded-brand font-body font-extrabold text-base transition-all duration-300 shadow-lg shadow-brand-primary/10 ${
                selectedIds.length > 0
                  ? 'bg-brand-primary hover:bg-brand-primary/90 text-white cursor-pointer active:scale-95'
                  : 'bg-[#F2EFE6] text-[#A2A292] cursor-not-allowed border border-[#EBEBE2]'
              }`}
            >
              <CalendarIcon size={18} className="stroke-[2.5]" />
              <span>添加到菜单日历 ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Date Picker Drawer Modal */}
      {dateModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#FAF9F5] border border-[#EBEBE2] rounded-brand shadow-2xl overflow-hidden paper-texture">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBE2]">
              <h3 className="font-headline font-bold text-lg text-brand-charcoal flex items-center gap-2">
                <CalendarIcon size={18} className="text-brand-primary" />
                <span>选择日期</span>
              </h3>
              <button
                onClick={() => setDateModalVisible(false)}
                className="text-[#A2A292] hover:text-brand-charcoal p-1 hover:bg-[#F2EFE6] rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="font-body text-xs text-[#9E9E8E] leading-relaxed">
                选择要将 {selectedIds.length} 道菜安排在哪一天。
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {getDateOptions().map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedDate(opt.value)}
                    className={`w-full text-left px-4 py-3.5 rounded-brand font-body text-sm font-semibold transition-all duration-200 ${
                      selectedDate === opt.value
                        ? 'bg-brand-primary text-white shadow-md'
                        : 'bg-[#F2EFE6] hover:bg-[#EBEBE2] text-brand-charcoal'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#EBEBE2]">
                <button
                  onClick={() => setDateModalVisible(false)}
                  className="flex-1 py-3 border border-[#EBEBE2] rounded-brand text-sm font-body font-bold text-[#5E5E54] hover:bg-[#F2EFE6] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmAddToCalendar}
                  disabled={submitting}
                  className="flex-1 py-3 bg-brand-primary text-white rounded-brand text-sm font-body font-extrabold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/90 transition-colors flex justify-center items-center"
                >
                  {submitting ? <RefreshCw size={16} className="animate-spin" /> : '确认规划'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
