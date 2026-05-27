import React from 'react';
import { Sparkles, Calendar, BookOpen, MessageSquare } from 'lucide-react';

export default function IntroScreen({ onNavigate }) {
  const quickActions = [
    { id: 'planner', label: 'Plan a Meal', desc: 'Generate a random recommended menu', icon: Sparkles, color: 'bg-brand-primary' },
    { id: 'calendar', label: 'View Calendar', desc: 'See your planned menu timeline', icon: Calendar, color: 'bg-brand-secondary' },
    { id: 'recipes', label: 'Recipe Library', desc: 'Browse and import daily dishes', icon: BookOpen, color: 'bg-brand-tertiary' },
    { id: 'bot', label: 'Chat AI Chef', desc: 'Get culinary helper answers', icon: MessageSquare, color: 'bg-indigo-500' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 select-none">
      {/* Hero Header Card */}
      <div className="text-center mb-16 relative">
        <div className="text-7xl md:text-8xl mb-8 animate-float filter drop-shadow-md">
          🍳🥗🍝
        </div>
        <h1 className="font-headline font-extrabold text-5xl md:text-6xl tracking-tight text-brand-charcoal mb-4">
          WhatToEat
        </h1>
        <p className="font-body font-semibold text-lg md:text-xl text-[#5E5E54] max-w-md mx-auto leading-relaxed">
          Your daily culinary meal planner companion. Discover, plan, and create fresh recipes.
        </p>
      </div>

      {/* Main Call to Action Button */}
      <button
        onClick={() => onNavigate('planner')}
        className="group px-10 py-5 bg-brand-primary text-white rounded-full font-body font-extrabold text-lg md:text-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 mb-16"
      >
        <Sparkles size={24} className="stroke-[2.5] group-hover:rotate-12 transition-transform" />
        <span>Generate Random Menu</span>
      </button>

      {/* Grid of Quick Actions */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="flex items-center gap-5 p-5 bg-white border border-[#EBEBE2] rounded-brand cursor-pointer hover:shadow-premium-hover hover:border-brand-primary/20 hover:-translate-y-0.5 transition-all duration-300 shadow-premium"
            >
              <div className={`p-4 rounded-2xl text-white ${action.color} shadow-sm shrink-0`}>
                <Icon size={22} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-headline font-bold text-base text-brand-charcoal">
                  {action.label}
                </h3>
                <p className="font-body text-xs text-[#9E9E8E] mt-1">
                  {action.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
