import React, { useState } from 'react';
import AuthGuard from './components/AuthGuard';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import Alert from './components/Alert';

// Screen imports (will be created in next steps)
import IntroScreen from './screens/IntroScreen';
import RecommendedMenuScreen from './screens/RecommendedMenuScreen';
import MenuCalendarScreen from './screens/MenuCalendarScreen';
import RecipesScreen from './screens/RecipesScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import IngredientsScreen from './screens/IngredientsScreen';
import BotScreen from './screens/BotScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [currentParams, setCurrentParams] = useState(null);

  const navigate = (screen, params = null) => {
    setCurrentParams(params);
    setCurrentScreen(screen);
    // Scroll content to top on screen change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return <IntroScreen onNavigate={navigate} />;
      case 'planner':
        return <RecommendedMenuScreen onNavigate={navigate} />;
      case 'calendar':
        return <MenuCalendarScreen onNavigate={navigate} />;
      case 'recipes':
        return <RecipesScreen onNavigate={navigate} />;
      case 'recipe-detail':
        return <RecipeDetailScreen recipe={currentParams} onNavigate={navigate} />;
      case 'ingredients':
        return <IngredientsScreen onNavigate={navigate} />;
      case 'bot':
        return <BotScreen onNavigate={navigate} />;
      default:
        return <IntroScreen onNavigate={navigate} />;
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen bg-brand-background overflow-hidden relative">
        {/* Reusable Sidebar Navigation (Desktop) */}
        <Sidebar currentScreen={currentScreen} onNavigate={navigate} />

        {/* Main viewport */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar md:custom-scrollbar pb-32 md:pb-8 flex flex-col relative">
          <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-6">
            {renderActiveScreen()}
          </div>
        </main>

        {/* Reusable Floating Bottom Capsule Navigation (Mobile) */}
        <BottomBar currentScreen={currentScreen} onNavigate={navigate} />

        {/* Premium Alert Dialog Trigger */}
        <Alert />
      </div>
    </AuthGuard>
  );
}
