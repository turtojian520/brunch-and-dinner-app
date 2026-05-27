import React, { useState } from 'react';
import { ArrowLeft, Clock, Flame, BookOpen, Check, Play, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function RecipeDetailScreen({ recipe, onNavigate }) {
  if (!recipe) {
    return (
      <div className="py-12 text-center font-body">
        <p className="text-[#A2A292]">No recipe selected.</p>
        <button onClick={() => onNavigate('recipes')} className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-brand">
          Return to Library
        </button>
      </div>
    );
  }

  // Check off states
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState([]);

  // Distraction-free Chef Mode State
  const [chefModeActive, setChefModeActive] = useState(false);
  const [activeChefStep, setActiveChefStep] = useState(0);

  const toggleIngredient = (name) => {
    setCheckedIngredients(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const toggleStep = (index) => {
    setCheckedSteps(prev =>
      prev.includes(index) ? prev.filter(item => item !== index) : [...prev, index]
    );
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
    <div className="py-4 select-none relative">
      {/* Distraction-Free full viewport chef Mode Overlay */}
      {chefModeActive && (
        <div className="fixed inset-0 z-50 bg-[#FAF9F5] flex flex-col justify-between p-8 md:p-16 select-none paper-texture animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EBEBE2] pb-6">
            <div className="min-w-0">
              <span className="font-label text-[10px] font-extrabold uppercase tracking-widest text-[#A2A292]">Active Chef Mode</span>
              <h2 className="font-headline font-extrabold text-2xl text-brand-charcoal truncate mt-1">{recipe.name}</h2>
            </div>
            <button
              onClick={() => setChefModeActive(false)}
              className="p-3 border border-[#EBEBE2] hover:bg-[#F2EFE6] rounded-full text-brand-charcoal transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Core giant Step Display */}
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto py-12">
            <div className="flex items-start gap-6">
              <span className="font-headline font-extrabold text-brand-primary text-5xl md:text-7xl leading-none">
                {activeChefStep + 1}
              </span>
              <div className="space-y-4">
                <p className="font-body font-bold text-2xl md:text-4xl text-brand-charcoal leading-relaxed">
                  {recipe.steps[activeChefStep]}
                </p>
                <div className="flex items-center gap-3 pt-4">
                  <span className="font-label text-xs font-bold text-[#A2A292] uppercase tracking-wider">
                    Step Progress: {activeChefStep + 1} of {recipe.steps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-[#EBEBE2]">
            <button
              onClick={() => setActiveChefStep(prev => Math.max(0, prev - 1))}
              disabled={activeChefStep === 0}
              className={`flex items-center gap-2.5 px-6 py-4 rounded-brand font-body font-bold text-base transition-colors ${
                activeChefStep === 0
                  ? 'bg-transparent text-[#CCC] cursor-not-allowed'
                  : 'bg-[#F2EFE6] hover:bg-[#EBEBE2] text-brand-charcoal'
              }`}
            >
              <ChevronLeft size={20} />
              <span>Previous Step</span>
            </button>

            <button
              onClick={() => {
                if (activeChefStep < recipe.steps.length - 1) {
                  setActiveChefStep(prev => prev + 1);
                } else {
                  setChefModeActive(false);
                  showAlert('Cooking Finished!', `Enjoy your delicious homemade ${recipe.name}!`);
                }
              }}
              className="flex items-center gap-2.5 px-8 py-4 bg-brand-primary text-white rounded-brand font-body font-extrabold text-base shadow-lg shadow-brand-primary/10 hover:bg-brand-primary/95 transition-colors"
            >
              <span>{activeChefStep === recipe.steps.length - 1 ? 'Finish & Enjoy' : 'Next Step'}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Standard Detail Page */}
      <div className="space-y-8">
        {/* Navigation back and Chef Mode Launch */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('recipes')}
            className="flex items-center gap-2 text-sm font-body font-bold text-[#5E5E54] hover:text-brand-charcoal transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Library</span>
          </button>
          
          <button
            onClick={() => {
              setActiveChefStep(0);
              setChefModeActive(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-[#38B000] hover:bg-[#38B000]/90 text-white rounded-brand font-body font-bold text-sm shadow-md shadow-[#38B000]/10 transition-colors"
          >
            <Play size={15} fill="currentColor" />
            <span>Start Cooking Mode</span>
          </button>
        </div>

        {/* Recipe Headers */}
        <div className="bg-white border border-[#EBEBE2] rounded-brand p-8 shadow-premium paper-texture flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full font-label font-bold text-[10px] uppercase tracking-wider ${getMealTypeBadge(recipe.mealType)}`}>
              {recipe.mealType}
            </span>
          </div>

          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-brand-charcoal tracking-tight leading-snug">
            {recipe.name}
          </h2>

          <div className="flex items-center gap-6 border-t border-[#EBEBE2]/40 pt-5 mt-2">
            <div className="flex items-center gap-2 text-[#5E5E54] font-body font-bold text-sm">
              <Clock size={16} className="text-[#A2A292]" />
              <span>Time Required: {recipe.time} mins</span>
            </div>
            <div className="flex items-center gap-2 text-[#5E5E54] font-body font-bold text-sm">
              <Flame size={16} className="text-[#A2A292]" />
              <span className="capitalize">Cooking Level: {recipe.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Core Checklist grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ingredients list */}
          <div className="lg:col-span-5 bg-white border border-[#EBEBE2] rounded-brand p-6 shadow-premium paper-texture">
            <h3 className="font-headline font-extrabold text-lg text-brand-charcoal mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-brand-primary" />
              <span>Ingredient Stock</span>
            </h3>
            
            {recipe.ingredients.length === 0 ? (
              <p className="text-xs font-body text-[#9E9E8E] italic">No specific ingredients logged.</p>
            ) : (
              <div className="space-y-2.5">
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = checkedIngredients.includes(ing.name);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIngredient(ing.name)}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer select-none transition-all duration-200 ${
                        isChecked
                          ? 'bg-[#38B000]/[0.02] border-[#38B000]/40 text-[#A2A292]'
                          : 'bg-[#FAF9F5]/40 border-[#EBEBE2] text-brand-charcoal hover:bg-[#F2EFE6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isChecked ? 'bg-[#38B000] border-[#38B000] text-white' : 'border-[#A2A292] text-transparent'
                        }`}>
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span className={`text-sm font-body font-semibold ${isChecked ? 'line-through' : ''}`}>
                          {ing.name}
                        </span>
                      </div>
                      <span className="font-label text-xs font-bold text-[#A2A292]">
                        {ing.quantity} {ing.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step descriptions */}
          <div className="lg:col-span-7 bg-white border border-[#EBEBE2] rounded-brand p-6 shadow-premium paper-texture">
            <h3 className="font-headline font-extrabold text-lg text-brand-charcoal mb-4">Cooking Directions</h3>
            
            {recipe.steps.length === 0 ? (
              <p className="text-xs font-body text-[#9E9E8E] italic">No directions logged.</p>
            ) : (
              <div className="space-y-4">
                {recipe.steps.map((st, idx) => {
                  const isChecked = checkedSteps.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        isChecked
                          ? 'border-[#38B000]/30 bg-[#38B000]/[0.01]'
                          : 'border-[#EBEBE2] hover:bg-[#FAF9F5]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-label text-xs font-bold transition-colors ${
                        isChecked ? 'bg-[#38B000] text-white' : 'bg-[#F2EFE6] text-brand-charcoal'
                      }`}>
                        {isChecked ? <Check size={12} className="stroke-[3]" /> : idx + 1}
                      </div>
                      
                      <p className={`font-body text-sm font-semibold leading-relaxed ${
                        isChecked ? 'text-[#A2A292] line-through' : 'text-brand-charcoal'
                      }`}>
                        {st}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
