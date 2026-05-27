import React from 'react';
import { ChefHat, Calendar, Refrigerator, Sparkles, MessageSquare, Book } from 'lucide-react';

export default function BottomBar({ currentScreen, onNavigate }) {
  const menuItems = [
    { id: 'intro', label: 'Home', icon: ChefHat },
    { id: 'planner', label: 'Plan', icon: Sparkles },
    { id: 'calendar', label: 'Cal', icon: Calendar },
    { id: 'recipes', label: 'Book', icon: Book },
    { id: 'ingredients', label: 'Stock', icon: Refrigerator },
    { id: 'bot', label: 'Chef', icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-[#FAF9F5]/85 backdrop-blur-xl border border-[#EBEBE2]/60 rounded-full py-3.5 px-4 shadow-[0_12px_40px_rgba(15,23,42,0.1)] flex items-center justify-between transition-transform duration-300">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id || (item.id === 'planner' && currentScreen === 'planner') || (item.id === 'recipes' && currentScreen === 'recipe-detail');

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center justify-center flex-1 relative active:scale-95 transition-transform"
          >
            <div
              className={`p-2 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-brand-primary text-white scale-110 shadow-md shadow-brand-primary/20'
                  : 'text-[#5E5E54]'
              }`}
            >
              <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
            </div>
            
            {/* Nav label */}
            <span
              className={`text-[9px] font-label font-bold mt-1 tracking-wider uppercase transition-colors duration-300 ${
                isActive ? 'text-brand-primary font-extrabold' : 'text-[#A2A292]'
              }`}
            >
              {item.label}
            </span>

            {/* Glowing active indicator dot */}
            {isActive && (
              <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-brand-primary animate-ping" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
