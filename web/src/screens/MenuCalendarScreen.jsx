import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Trash2, ArrowLeft, ArrowRight, Sun, Sunset, Moon, ChevronRight } from 'lucide-react';
import { MenuCalendarService } from '../services/menuCalendarService';
import { showAlert } from '../utils/alert';

export default function MenuCalendarScreen({ onNavigate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [dayMeals, setDayMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDateStr(todayStr);
    loadMarkedDates();
    loadMealsForDate(todayStr);
  }, []);

  const loadMarkedDates = async () => {
    try {
      const result = await MenuCalendarService.getMarkedDates();
      if (result.success && result.data) {
        setMarkedDates(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMealsForDate = async (dateStr) => {
    try {
      setLoading(true);
      const result = await MenuCalendarService.getGroupedMenuByDate(dateStr);
      if (result.success && result.data) {
        setDayMeals(result.data);
      }
    } catch (err) {
      console.error(err);
      setDayMeals({ breakfast: [], lunch: [], dinner: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (dateStr) => {
    setSelectedDateStr(dateStr);
    loadMealsForDate(dateStr);
  };

  const handleDeleteMeal = async (recipe, mealType) => {
    if (confirm(`Remove "${recipe.name}" from your plan on ${selectedDateStr}?`)) {
      try {
        const result = await MenuCalendarService.removeRecipeByDateAndId(selectedDateStr, recipe.id);
        if (result.success) {
          showAlert('Success', 'Removed dish from plan.');
          loadMealsForDate(selectedDateStr);
          loadMarkedDates();
        } else {
          showAlert('Error', 'Failed to remove dish.');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error', 'Failed to remove dish.');
      }
    }
  };

  // Calendar Math Helpers
  const changeMonth = (offset) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(next);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Fill previous month overlap
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      days.push({ date: currDate, isCurrentMonth: true });
    }

    // Fill next month overlap to complete grid (usually 42 squares)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const formatMonthTitle = () => {
    return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getMealHeaderStyles = (type) => {
    switch (type) {
      case 'breakfast': return { bg: 'bg-amber-500', text: 'text-amber-500', icon: Sun, iconColor: 'text-amber-500 bg-amber-500/10' };
      case 'lunch': return { bg: 'bg-teal-500', text: 'text-teal-500', icon: Sunset, iconColor: 'text-teal-500 bg-teal-500/10' };
      case 'dinner': return { bg: 'bg-rose-500', text: 'text-rose-500', icon: Moon, iconColor: 'text-rose-500 bg-rose-500/10' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-500', icon: CalendarIcon, iconColor: 'text-gray-500 bg-gray-500/10' };
    }
  };

  const gridDays = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hasPlannedMeals = dayMeals && (dayMeals.breakfast?.length > 0 || dayMeals.lunch?.length > 0 || dayMeals.dinner?.length > 0);

  return (
    <div className="space-y-8 select-none py-4">
      {/* Title Header */}
      <div>
        <h2 className="font-headline font-extrabold text-3xl tracking-tight text-brand-charcoal">
          Meal Schedule Calendar
        </h2>
        <p className="font-body text-sm font-semibold text-[#A2A292] mt-1">
          Review and coordinate your planned breakfast, lunch, and dinner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customized HTML Calendar Widget */}
        <div className="lg:col-span-7 bg-white border border-[#EBEBE2] rounded-brand p-6 shadow-premium paper-texture">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-extrabold text-lg text-brand-charcoal">
              {formatMonthTitle()}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 border border-[#EBEBE2] hover:bg-[#F2EFE6] rounded-xl text-brand-charcoal transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 border border-[#EBEBE2] hover:bg-[#F2EFE6] rounded-xl text-brand-charcoal transition-colors"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekdays Row */}
          <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
            {weekDays.map(day => (
              <span key={day} className="font-label text-[11px] font-bold text-[#A2A292] uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Grid of Days */}
          <div className="grid grid-cols-7 gap-y-2 text-center">
            {gridDays.map((dayItem, index) => {
              const dStr = dayItem.date.toISOString().split('T')[0];
              const isSelected = selectedDateStr === dStr;
              const hasMeals = markedDates[dStr];
              const isToday = new Date().toISOString().split('T')[0] === dStr;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDaySelect(dStr)}
                  className={`relative py-3.5 flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
                    !dayItem.isCurrentMonth ? 'opacity-30' : ''
                  } ${
                    isSelected
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105 font-bold'
                      : 'hover:bg-[#F2EFE6] text-brand-charcoal font-semibold'
                  }`}
                >
                  <span className="text-sm">{dayItem.date.getDate()}</span>
                  
                  {/* Under dots */}
                  {hasMeals && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-brand-primary'
                    }`} />
                  )}

                  {/* Gentle circle border for Today */}
                  {isToday && !isSelected && (
                    <span className="absolute inset-2 border border-brand-primary/30 rounded-xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grouped Timeline Meals list */}
        <div className="lg:col-span-5 space-y-6">
          <div className="px-1">
            <h3 className="font-headline font-extrabold text-xl text-brand-charcoal leading-snug">
              {formatDateLabel(selectedDateStr)}
            </h3>
            <p className="font-body text-xs text-[#9E9E8E] font-semibold mt-1">Planned items list</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="animate-spin text-brand-primary" />
            </div>
          ) : !hasPlannedMeals ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white border border-dashed border-[#EBEBE2] rounded-brand p-8 text-center shadow-premium">
              <div className="text-3xl mb-3">📅</div>
              <h4 className="font-headline font-bold text-base text-brand-charcoal">No Meals Planned</h4>
              <p className="font-body text-xs text-[#9E9E8E] mt-1.5 max-w-xs mx-auto">
                Discover dishes on the Home page or Shuffle list and plan them here!
              </p>
              <button
                onClick={() => onNavigate('planner')}
                className="mt-4 px-5 py-2.5 bg-[#F2EFE6] hover:bg-[#EBEBE2] text-brand-charcoal border border-[#EBEBE2] font-body font-bold text-xs rounded-brand"
              >
                Go Plan Meals
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {['breakfast', 'lunch', 'dinner'].map((type) => {
                const meals = dayMeals[type] || [];
                if (meals.length === 0) return null;
                const style = getMealHeaderStyles(type);
                const TypeIcon = style.icon;

                return (
                  <div key={type} className="bg-white border border-[#EBEBE2] rounded-brand overflow-hidden shadow-premium paper-texture">
                    {/* Meal Header */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-[#EBEBE2]">
                      <div className={`p-2 rounded-xl ${style.iconColor}`}>
                        <TypeIcon size={18} className="stroke-[2.5]" />
                      </div>
                      <h4 className="font-headline font-extrabold text-sm uppercase tracking-widest text-brand-charcoal">
                        {type}
                      </h4>
                    </div>

                    {/* Meal list */}
                    <div className="divide-y divide-[#EBEBE2]/40">
                      {meals.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="flex items-center justify-between p-4 pl-5 group hover:bg-brand-primary/[0.01] transition-colors"
                        >
                          <div
                            onClick={() => onNavigate('recipe-detail', item)}
                            className="flex-1 pr-4 cursor-pointer"
                          >
                            <h5 className="font-headline font-extrabold text-base text-brand-charcoal group-hover:text-brand-primary transition-colors">
                              {item.name}
                            </h5>
                            <p className="font-body text-xs font-semibold text-[#9E9E8E] mt-0.5">
                              {item.time} mins · <span className="capitalize">{item.difficulty}</span>
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteMeal(item, type)}
                            className="text-[#A2A292] hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
