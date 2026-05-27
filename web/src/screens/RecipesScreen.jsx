import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Plus, Sparkles, Clock, Flame, Trash2, X, PlusCircle } from 'lucide-react';
import { RecipeService } from '../services/recipeService';
import { AiService } from '../services/aiService';
import { showAlert } from '../utils/alert';

export default function RecipesScreen({ onNavigate }) {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Modal States
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  
  // Create Manual Recipe Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    mealType: 'lunch',
    difficulty: 'easy',
    time: 20,
    ingredients: [{ name: '', property: 'vegetable', quantity: '', unit: 'g' }],
    steps: ['']
  });

  // AI Import Form State
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recipes, searchQuery, mealTypeFilter, difficultyFilter]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const result = await RecipeService.getAllRecipes();
      if (result.success && result.data) {
        setRecipes(RecipeService.transformArrayToFrontend(result.data));
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to load recipe library.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...recipes];
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }
    
    // Meal type filter
    if (mealTypeFilter !== 'all') {
      list = list.filter(r => r.mealType === mealTypeFilter);
    }
    
    // Difficulty filter
    if (difficultyFilter !== 'all') {
      list = list.filter(r => r.difficulty === difficultyFilter);
    }
    
    setFilteredRecipes(list);
  };

  // Manual Creation Handlers
  const addIngredientField = () => {
    setManualForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', property: 'vegetable', quantity: '', unit: 'g' }]
    }));
  };

  const updateIngredientField = (index, field, value) => {
    const updated = [...manualForm.ingredients];
    updated[index][field] = value;
    setManualForm(prev => ({ ...prev, ingredients: updated }));
  };

  const removeIngredientField = (index) => {
    setManualForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addStepField = () => {
    setManualForm(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const updateStepField = (index, value) => {
    const updated = [...manualForm.steps];
    updated[index] = value;
    setManualForm(prev => ({ ...prev, steps: updated }));
  };

  const removeStepField = (index) => {
    setManualForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.name.trim()) {
      showAlert('Notice', 'Please fill in the dish name.');
      return;
    }
    
    // Clean fields
    const cleanedIngredients = manualForm.ingredients.filter(ing => ing.name.trim());
    const cleanedSteps = manualForm.steps.filter(st => st.trim());
    
    const recipeData = {
      ...manualForm,
      ingredients: cleanedIngredients,
      steps: cleanedSteps
    };

    try {
      const result = await RecipeService.createRecipe(recipeData);
      if (result.success) {
        showAlert('Success', 'Recipe created successfully!');
        setCreateModalVisible(false);
        // Reset form
        setManualForm({
          name: '',
          mealType: 'lunch',
          difficulty: 'easy',
          time: 20,
          ingredients: [{ name: '', property: 'vegetable', quantity: '', unit: 'g' }],
          steps: ['']
        });
        loadRecipes();
      } else {
        showAlert('Error', result.error || 'Failed to create recipe.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to create recipe.');
    }
  };

  // AI Import Handler
  const handleAIImport = async () => {
    if (!importText.trim()) {
      showAlert('Notice', 'Please paste the recipe text description first.');
      return;
    }

    try {
      setImporting(true);
      // Construct a query to prompt the AI to parse loose text
      const prompt = `You are a culinary data parsing assistant. Extract a recipe from this loose text description:
"${importText}"

You MUST respond in the following JSON format ONLY, with no additional explanation text:
{
  "name": "Extracted Dish Name",
  "mealType": "breakfast/lunch/dinner based on context",
  "difficulty": "easy/medium/difficult",
  "time": approximate_minutes_integer,
  "ingredients": [
    { "name": "Ingredient Name", "property": "vegetable/meat/dairy/seasoning/grain/protein/fruit/oil", "quantity": "number", "unit": "g/pcs/tbsp/tsp/ml/cup" }
  ],
  "steps": [
    "Step 1 description",
    "Step 2 description"
  ]
}

Provide accurate extractions. Return ONLY the JSON object structure.`;

      const result = await AiService.chat(prompt, []);
      if (result.success && result.text) {
        let jsonStr = result.text.trim();
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const parsedRecipe = JSON.parse(jsonStr);
        
        // Write parsed recipe into DB
        const saveResult = await RecipeService.createRecipe(parsedRecipe);
        if (saveResult.success) {
          showAlert('Import Success', `AI successfully imported "${parsedRecipe.name}"!`);
          setImportModalVisible(false);
          setImportText('');
          loadRecipes();
        } else {
          showAlert('Save Failed', 'Parsed successfully, but failed to save in library.');
        }
      } else {
        showAlert('Import Failed', result.error || 'Failed to parse recipe description.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Parsing Error', 'Make sure the text contains clear cooking descriptions.');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteRecipe = async (recipe, e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${recipe.name}" from your library?`)) {
      try {
        const result = await RecipeService.deleteRecipe(recipe.id);
        if (result.success) {
          showAlert('Deleted', `Removed "${recipe.name}".`);
          loadRecipes();
        } else {
          showAlert('Error', 'Failed to delete recipe.');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error', 'Failed to delete recipe.');
      }
    }
  };

  const getMealTypeBadge = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'bg-amber-100 text-amber-700';
      case 'lunch': return 'bg-teal-100 text-teal-700';
      case 'dinner': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8 select-none py-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-3xl tracking-tight text-brand-charcoal flex items-center gap-2">
            <BookOpen className="text-brand-primary shrink-0" />
            <span>Recipe Library</span>
          </h2>
          <p className="font-body text-sm font-semibold text-[#A2A292] mt-1">
            Log and manage your favorite homemade recipes.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setCreateModalVisible(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-[#EBEBE2] hover:bg-[#F2EFE6] text-brand-charcoal rounded-brand font-body font-bold text-sm transition-all active:scale-95 shadow-premium"
          >
            <Plus size={16} />
            <span>Create Manual</span>
          </button>
          <button
            onClick={() => setImportModalVisible(true)}
            className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-brand font-body font-bold text-sm transition-all active:scale-95 shadow-md shadow-brand-primary/10"
          >
            <Sparkles size={16} />
            <span>AI Smart Import</span>
          </button>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative bg-white border border-[#EBEBE2] rounded-brand shadow-premium flex items-center px-4">
          <Search size={18} className="text-[#A2A292] shrink-0" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 py-3.5 bg-transparent border-none text-sm font-body focus:ring-0 text-brand-charcoal placeholder:text-[#A2A292]"
          />
        </div>
        
        {/* Filters Grid */}
        <div className="flex gap-3">
          {/* Meal type filter */}
          <select
            value={mealTypeFilter}
            onChange={(e) => setMealTypeFilter(e.target.value)}
            className="px-4 py-3.5 bg-white border border-[#EBEBE2] rounded-brand font-body text-sm font-bold text-[#5E5E54] focus:ring-0 shadow-premium outline-none"
          >
            <option value="all">All Meal Types</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>

          {/* Difficulty filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-3.5 bg-white border border-[#EBEBE2] rounded-brand font-body text-sm font-bold text-[#5E5E54] focus:ring-0 shadow-premium outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>
      </div>

      {/* Grid of recipes */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw size={36} className="animate-spin text-brand-primary" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-[#EBEBE2] rounded-brand p-12 text-center shadow-premium">
          <BookOpen size={40} className="text-[#A2A292] mb-3" />
          <h3 className="font-headline font-bold text-lg text-brand-charcoal">No Recipes Match Filters</h3>
          <p className="font-body text-sm text-[#A2A292] mt-2">
            Try adjusting your search terms or add a new dish to your catalog!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('recipe-detail', item)}
              className="group bg-white border border-[#EBEBE2] rounded-brand p-6 cursor-pointer hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-300 shadow-premium flex flex-col justify-between paper-texture h-56"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-full font-label font-bold text-[9px] uppercase tracking-wider ${getMealTypeBadge(item.mealType)}`}>
                    {item.mealType}
                  </span>
                  
                  {/* Quick delete button */}
                  <button
                    onClick={(e) => handleDeleteRecipe(item, e)}
                    className="text-[#A2A292] hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3 className="font-headline font-extrabold text-lg text-brand-charcoal group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug mb-3">
                  {item.name}
                </h3>
              </div>

              {/* Recipe Stats info */}
              <div className="flex items-center gap-4 border-t border-[#EBEBE2]/40 pt-4 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-[#9E9E8E] font-body font-bold">
                  <Clock size={13} className="text-[#A2A292]" />
                  <span>{item.time} mins</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#9E9E8E] font-body font-bold">
                  <Flame size={13} className="text-[#A2A292]" />
                  <span className="capitalize">{item.difficulty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* manual recipe modal form overlay */}
      {createModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-md overflow-y-auto no-scrollbar">
          <div className="w-full max-w-lg bg-[#FAF9F5] border border-[#EBEBE2] rounded-brand shadow-2xl overflow-hidden paper-texture my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBE2]">
              <h3 className="font-headline font-bold text-lg text-brand-charcoal">
                Create Recipe Manually
              </h3>
              <button
                onClick={() => setCreateModalVisible(false)}
                className="text-[#A2A292] hover:text-brand-charcoal p-1 hover:bg-[#F2EFE6] rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Dish Name */}
              <div className="space-y-2">
                <label className="font-body text-xs font-bold text-brand-charcoal uppercase tracking-wider">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrambled Eggs with Toast"
                  value={manualForm.name}
                  onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-[#EBEBE2] rounded-brand text-sm font-body focus:ring-0 text-brand-charcoal"
                />
              </div>

              {/* Grid 3 details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-body text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Meal Type</label>
                  <select
                    value={manualForm.mealType}
                    onChange={(e) => setManualForm(prev => ({ ...prev, mealType: e.target.value }))}
                    className="w-full px-3 py-3 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="font-body text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Difficulty</label>
                  <select
                    value={manualForm.difficulty}
                    onChange={(e) => setManualForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-3 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-body text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Time (mins)</label>
                  <input
                    type="number"
                    value={manualForm.time}
                    onChange={(e) => setManualForm(prev => ({ ...prev, time: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-3 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0"
                  />
                </div>
              </div>

              {/* Ingredients Form Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-body text-xs font-bold text-brand-charcoal uppercase tracking-wider">Ingredients</label>
                  <button
                    type="button"
                    onClick={addIngredientField}
                    className="text-xs font-body font-bold text-brand-primary flex items-center gap-1 hover:underline"
                  >
                    <PlusCircle size={14} />
                    <span>Add Item</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {manualForm.ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-2 items-center bg-white border border-[#EBEBE2]/60 p-2.5 rounded-brand">
                      <input
                        type="text"
                        placeholder="Ingredient Name"
                        value={ing.name}
                        onChange={(e) => updateIngredientField(index, 'name', e.target.value)}
                        className="flex-1 border-none focus:ring-0 text-xs font-body p-0 pl-1 text-brand-charcoal"
                      />
                      <input
                        type="text"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) => updateIngredientField(index, 'quantity', e.target.value)}
                        className="w-12 border-none focus:ring-0 text-xs font-body p-0 text-center"
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={ing.unit}
                        onChange={(e) => updateIngredientField(index, 'unit', e.target.value)}
                        className="w-12 border-none focus:ring-0 text-xs font-body p-0 text-center"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeIngredientField(index)}
                        className="text-[#A2A292] hover:text-red-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps Checklist Form Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-body text-xs font-bold text-brand-charcoal uppercase tracking-wider">Cooking Steps</label>
                  <button
                    type="button"
                    onClick={addStepField}
                    className="text-xs font-body font-bold text-brand-primary flex items-center gap-1 hover:underline"
                  >
                    <PlusCircle size={14} />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {manualForm.steps.map((st, index) => (
                    <div key={index} className="flex gap-2.5 items-start bg-white border border-[#EBEBE2]/60 p-2.5 rounded-brand">
                      <span className="font-label text-xs font-bold text-[#A2A292] pt-1">{index + 1}.</span>
                      <textarea
                        rows={1}
                        placeholder="Describe step details..."
                        value={st}
                        onChange={(e) => updateStepField(index, e.target.value)}
                        className="flex-1 border-none focus:ring-0 text-xs font-body p-0 text-brand-charcoal resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeStepField(index)}
                        className="text-[#A2A292] hover:text-red-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-6 border-t border-[#EBEBE2]">
                <button
                  type="button"
                  onClick={() => setCreateModalVisible(false)}
                  className="flex-1 py-3 border border-[#EBEBE2] rounded-brand text-sm font-body font-bold text-[#5E5E54] hover:bg-[#F2EFE6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-primary text-white rounded-brand text-sm font-body font-extrabold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/90 transition-colors"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Smart Import Drawer Overlay */}
      {importModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#FAF9F5] border border-[#EBEBE2] rounded-brand shadow-2xl overflow-hidden paper-texture">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBE2]">
              <h3 className="font-headline font-bold text-lg text-brand-charcoal flex items-center gap-2">
                <Sparkles size={18} className="text-brand-primary animate-gentle-pulse" />
                <span>AI Recipe Extractor</span>
              </h3>
              <button
                onClick={() => setImportModalVisible(false)}
                className="text-[#A2A292] hover:text-brand-charcoal p-1 hover:bg-[#F2EFE6] rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="font-body text-xs text-[#9E9E8E] leading-relaxed">
                Paste any culinary paragraph, loose list, or chat transcript below, and Gemini AI will instantly parse it into a beautiful recipe with quantities and structured steps.
              </p>
              
              <textarea
                rows={8}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste loose text here..."
                className="w-full p-4 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0 text-brand-charcoal shadow-inner"
              />

              <div className="flex gap-3 pt-4 border-t border-[#EBEBE2]">
                <button
                  onClick={() => setImportModalVisible(false)}
                  className="flex-1 py-3 border border-[#EBEBE2] rounded-brand text-sm font-body font-bold text-[#5E5E54] hover:bg-[#F2EFE6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIImport}
                  disabled={importing}
                  className="flex-1 py-3 bg-brand-primary text-white rounded-brand text-sm font-body font-extrabold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Extract with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
