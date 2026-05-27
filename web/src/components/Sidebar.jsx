import React from 'react';
import { ChefHat, Calendar, Refrigerator, Sparkles, MessageSquare, Book } from 'lucide-react';

export default function Sidebar({ currentScreen, onNavigate }) {
  const menuItems = [
    { id: 'intro', name: 'Home', icon: ChefHat },
    { id: 'planner', name: 'Meal Planner', icon: Sparkles },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'recipes', name: 'Recipes', icon: Book },
    { id: 'ingredients', name: 'Kitchen Stock', icon: Refrigerator },
    { id: 'bot', name: 'AI Chef', icon: MessageSquare },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-[#FAF9F5] border-r border-[#EBEBE2] p-8 shrink-0 select-none paper-texture">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => onNavigate('intro')}>
        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/20 animate-float">
          <ChefHat size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-brand-charcoal">
            WhatToEat
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#A2A292] font-label">
            Culinary Companion
          </p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || (item.id === 'planner' && currentScreen === 'planner') || (item.id === 'recipes' && currentScreen === 'recipe-detail');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-brand font-body font-semibold text-[15px] transition-all duration-300 relative group ${
                isActive
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/15'
                  : 'text-[#5E5E54] hover:bg-[#F2EFE6] hover:text-brand-charcoal'
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                }`}
              />
              <span>{item.name}</span>
              
              {/* Subtle hover pill for inactive items */}
              {!isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-primary/0 group-hover:bg-brand-primary/60 transition-colors" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-6 border-t border-[#EBEBE2] mt-auto">
        <div className="flex items-center gap-3 p-2 bg-[#F2EFE6] rounded-brand">
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
            KC
          </div>
          <div>
            <div className="font-body text-xs font-bold text-brand-charcoal">Kitchen Master</div>
            <div className="font-label text-[10px] text-[#A2A292]">Local Sandbox</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
