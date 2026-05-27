import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, RefreshCw, ChefHat, MessageSquare, Plus } from 'lucide-react';
import { AiService } from '../services/aiService';
import { RecipeService } from '../services/recipeService';
import { IngredientService } from '../services/ingredientService';
import { showAlert } from '../utils/alert';

export default function BotScreen() {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      text: 'Hi there! I am your WhatToEat AI Chef. I can see your current kitchen stock and library. Ask me to recommend custom dishes, suggest ingredients swaps, or help you cook step-by-step!',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fridgeContext, setFridgeContext] = useState({ ingredients: [], recipes: [] });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadKitchenContext();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadKitchenContext = async () => {
    try {
      const ingResult = await IngredientService.getAllIngredients();
      const recResult = await RecipeService.getAllRecipes();
      
      const ingredients = ingResult.success && ingResult.data 
        ? IngredientService.transformArrayToFrontend(ingResult.data)
        : [];
      const recipes = recResult.success && recResult.data
        ? RecipeService.transformArrayToFrontend(recResult.data)
        : [];

      setFridgeContext({ ingredients, recipes });
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');

    // Append user message
    const userMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: userMsgId, text, isBot: false, timestamp: new Date() }]);
    
    try {
      setLoading(true);
      const chatHistory = messages.map(msg => ({ text: msg.text, isBot: msg.isBot }));
      
      const result = await AiService.chat(text, chatHistory, fridgeContext);
      if (result.success && result.text) {
        setMessages(prev => [...prev, { 
          id: crypto.randomUUID(), 
          text: result.text, 
          isBot: true, 
          timestamp: new Date() 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          id: crypto.randomUUID(), 
          text: result.error || 'Failed to generate a reply.', 
          isBot: true, 
          timestamp: new Date() 
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(), 
        text: 'An error occurred. Check your server connection.', 
        isBot: true, 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Structured Recipe Extraction & Saving from AI messages
  const checkMessageForRecipe = (text) => {
    // If the message has ingredients and steps inside JSON or marked structures, let them save it
    return AiService.parseRecipeFromChat(text, 'Extracted AI Recipe');
  };

  const handleSaveAIRecipe = async (recipe, msgId) => {
    // Open a prompt to name the recipe
    const customName = prompt('Enter a name for this recipe in your library:', recipe.name || 'AI Chef Recommendation');
    if (!customName) return;

    const recipeData = {
      name: customName,
      mealType: 'lunch',
      difficulty: 'medium',
      time: 25,
      ingredients: recipe.ingredients,
      steps: recipe.steps
    };

    try {
      const result = await RecipeService.createRecipe(recipeData);
      if (result.success) {
        showAlert('Success Saved!', `Added "${customName}" to your Recipe Library!`);
        // Remove the recipe action button from state or disable it by marking it as saved
        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, recipeSaved: true } : m)
        );
      } else {
        showAlert('Error', 'Failed to save recipe.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'An error occurred.');
    }
  };

  const quickPrompts = [
    { text: 'Recommend a healthy lunch', label: '🥗 Healthy Lunch' },
    { text: 'What can I cook with my eggs?', label: '🍳 Cook with Eggs' },
    { text: 'High protein breakfast recipe', label: '🥩 High Protein' },
    { text: 'Quick dinner recipe in 15 mins', label: '⏰ Quick 15m' }
  ];

  return (
    <div className="flex flex-col h-[82vh] max-w-4xl mx-auto select-none py-4">
      {/* Bot Header */}
      <div className="flex items-center gap-3 border-b border-[#EBEBE2] pb-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm shrink-0">
          <ChefHat size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h2 className="font-headline font-extrabold text-2xl tracking-tight text-brand-charcoal">
            AI Culinary Chef Helper
          </h2>
          <p className="font-body text-xs font-semibold text-[#A2A292]">
            Ask questions, suggest dishes, or substitute items.
          </p>
        </div>
      </div>

      {/* Messages Stream Viewport */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar mb-4 bg-white/40 border border-[#EBEBE2]/40 rounded-brand p-5 paper-texture">
        {messages.map((msg) => {
          const extractedRecipe = checkMessageForRecipe(msg.text);
          
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'
              }`}
            >
              {/* Bot Avatar */}
              {msg.isBot && (
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                  <ChefHat size={16} />
                </div>
              )}

              {/* Speech bubble */}
              <div className="space-y-3 flex-1 min-w-0">
                <div
                  className={`p-4 rounded-brand text-sm font-body leading-relaxed whitespace-pre-line shadow-sm border ${
                    msg.isBot
                      ? 'bg-white text-brand-charcoal border-[#EBEBE2]'
                      : 'bg-brand-primary text-white border-brand-primary'
                  }`}
                >
                  {/* Clean up json chunks from visual text display if the AI printed raw JSON */}
                  {msg.isBot && msg.text.includes('{"ingredients":') 
                    ? msg.text.split('{"ingredients":')[0] + '\n*(Structured recipe details parsed successfully below)*'
                    : msg.text
                  }
                </div>

                {/* Structured Recipe suggestion banner */}
                {msg.isBot && extractedRecipe && (
                  <div className="bg-[#38B000]/5 border border-[#38B000]/20 rounded-brand p-4 shadow-sm flex flex-col gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#38B000] animate-gentle-pulse" />
                      <h4 className="font-headline font-extrabold text-sm text-[#38B000]">
                        Chef Suggestion Detected
                      </h4>
                    </div>
                    <p className="font-body text-xs text-[#5E5E54] leading-relaxed">
                      AI recommended a structured recipe with {extractedRecipe.ingredients?.length} ingredients! Save it to your library?
                    </p>
                    
                    <button
                      onClick={() => handleSaveAIRecipe(extractedRecipe, msg.id)}
                      disabled={msg.recipeSaved}
                      className={`flex items-center gap-1.5 justify-center py-2.5 px-4 rounded-brand font-body font-bold text-xs shadow-sm transition-all duration-300 ${
                        msg.recipeSaved
                          ? 'bg-[#EBEBE2] text-[#A2A292] cursor-not-allowed border border-[#EBEBE2]'
                          : 'bg-[#38B000] hover:bg-[#38B000]/90 text-white active:scale-95'
                      }`}
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                      <span>{msg.recipeSaved ? 'Saved to Library' : 'Save to Recipe Library'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading chef typing anim */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-start animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <ChefHat size={16} className="animate-spin" />
            </div>
            <div className="bg-white border border-[#EBEBE2] p-4 rounded-brand shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts List */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 px-1 shrink-0">
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.text)}
            className="px-4 py-2 border border-[#EBEBE2] bg-[#F2EFE6] hover:bg-[#EBEBE2] text-brand-charcoal rounded-full font-body font-bold text-xs shrink-0 active:scale-95 transition-all shadow-sm"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input panel bar */}
      <div className="flex gap-3 shrink-0">
        <input
          type="text"
          placeholder="Ask AI Chef what to eat or how to cook..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-5 py-4 bg-white border border-[#EBEBE2] rounded-brand text-sm font-body focus:ring-0 text-brand-charcoal shadow-premium outline-none"
        />
        <button
          onClick={() => handleSend()}
          className="px-6 py-4 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-brand shadow-lg shadow-brand-primary/15 transition-all active:scale-95 flex items-center justify-center shrink-0"
        >
          <Send size={18} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
