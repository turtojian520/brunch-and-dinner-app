import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar as CalendarIcon, RefreshCw, Clock, Flame, Check, X } from 'lucide-react';
import { RecipeService } from '../services/recipeService';
import { MenuCalendarService } from '../services/menuCalendarService';
import { showAlert } from '../utils/alert';

export default function RecommendedMenuScreen({ onNavigate }) {
  const [recipes, setRecipes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const result = await RecipeService.getAllRecipes();
      if (result.success && result.data) {
        const list = RecipeService.transformArrayToFrontend(result.data);
        generateMenu(list);
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to load recipes.');
    } finally {
      setLoading(false);
    }
  };

  const generateMenu = (list) => {
    const activeList = list.length > 0 ? list : [];
    if (activeList.length === 0) return;
    
    // Shuffle and pick up to 4
    const shuffled = [...activeList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(4, shuffled.length));
    setRecipes(selected);
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddClick = () => {
    if (selectedIds.length === 0) {
      showAlert('Notice', 'Please select at least one dish first.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setDateModalVisible(true);
  };

  const confirmAddToCalendar = async () => {
    if (!selectedDate) {
      showAlert('Error', 'Please select a date.');
      return;
    }

    try {
      setSubmitting(true);
      const selectedRecipes = recipes.filter(r => selectedIds.includes(r.id));
      const entries = selectedRecipes.map(recipe => ({
        date: selectedDate,
        recipeId: recipe.id,
        mealType: recipe.mealType || 'lunch',
      }));

      const result = await MenuCalendarService.addMultipleRecipesToMenu(entries);
      if (result.success) {
        showAlert('Added Successfully', `Planned ${selectedRecipes.length} dishes for ${selectedDate}!`);
        setDateModalVisible(false);
        setSelectedIds([]);
      } else {
        showAlert('Error', result.error || 'Failed to add entries.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'An error occurred.');
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
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateStr;
      dates.push({ value: dateStr, label });
    }
    return dates;
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
          <h2 className="font-headline font-extrabold text-3xl tracking-tight text-brand-charcoal">
            Today's Planner Board
          </h2>
          <p className="font-body text-sm font-semibold text-[#A2A292] mt-1">
            Hand-picked recommendations based on your kitchen.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => generateMenu(recipes)}
            className="flex items-center gap-2 px-5 py-3 bg-[#F2EFE6] hover:bg-[#EBEBE2] text-brand-charcoal rounded-brand font-body font-bold text-sm transition-all active:scale-95 border border-[#EBEBE2]"
          >
            <RefreshCw size={16} />
            <span>Shuffle New</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <RefreshCw size={40} className="animate-spin text-brand-primary mb-4" />
          <p className="font-body font-bold text-[#A2A292]">Sifting through recipes...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-[#EBEBE2] rounded-brand p-12 text-center shadow-premium">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="font-headline font-bold text-lg text-brand-charcoal">No Recipes Found</h3>
          <p className="font-body text-sm text-[#A2A292] mt-2 max-w-sm">
            Add or import some recipes in your library to start planning meals!
          </p>
          <button
            onClick={() => onNavigate('recipes')}
            className="mt-6 px-6 py-3 bg-brand-primary text-white font-body font-bold rounded-brand text-sm shadow-md"
          >
            Go to Recipe Library
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Card Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`group relative flex flex-col p-6 bg-white border rounded-brand cursor-pointer transition-all duration-300 shadow-premium hover:shadow-premium-hover ${
                    isSelected ? 'border-brand-primary bg-brand-primary/[0.02]' : 'border-[#EBEBE2]'
                  }`}
                >
                  {/* Select Tag Check */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1.5 rounded-full font-label font-bold text-[10px] uppercase tracking-wider ${getMealTypeBadge(item.mealType)}`}>
                      {item.mealType}
                    </span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-[#A2A292] text-transparent'
                    }`}>
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  </div>

                  {/* Header Title */}
                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('recipe-detail', item);
                    }}
                    className="font-headline font-extrabold text-xl text-brand-charcoal group-hover:text-brand-primary transition-colors line-clamp-1 mb-3"
                  >
                    {item.name}
                  </h3>

                  {/* Recipe Stats */}
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-[#9E9E8E] font-body font-bold">
                      <Clock size={14} className="text-[#A2A292]" />
                      <span>{item.time} mins</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#9E9E8E] font-body font-bold">
                      <Flame size={14} className="text-[#A2A292]" />
                      <span className="capitalize">{item.difficulty}</span>
                    </div>
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
              <span>Add to Meal Calendar ({selectedIds.length})</span>
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
                <span>Select Plan Date</span>
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
                Choose which date to schedule the selected {selectedIds.length} recipe(s).
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
                  Cancel
                </button>
                <button
                  onClick={confirmAddToCalendar}
                  disabled={submitting}
                  className="flex-1 py-3 bg-brand-primary text-white rounded-brand text-sm font-body font-extrabold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/90 transition-colors flex justify-center items-center"
                >
                  {submitting ? <RefreshCw size={16} className="animate-spin" /> : 'Confirm Planning'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
