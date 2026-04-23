# WhatToEat App - Complete Project Overview

## 📱 App Description

WhatToEat is a comprehensive meal planning and cooking assistant Android app built with React Native and Expo. It helps users discover recipes, manage ingredients, plan meals, and get AI-powered cooking assistance.

## 🎯 Core Features

### 1. Home Page (Introduction & Recommended Menu)
**Flow:**
- App opens to an introduction screen with illustrated emoji and app title
- "Generate Random Menu" button redirects to recommended menu page
- Displays 4 random recipes from the database
- Each recipe card shows:
  - Meal type tag (breakfast/lunch/dinner) with color coding
  - Recipe name (prominent)
  - Cooking time and difficulty level
  - Checkbox for selection

**Actions:**
- Check/uncheck recipes
- "Add to Menu Calendar" button (enabled when items selected)
- "Generate New Menu" button to refresh recommendations

### 2. Add to Calendar (Sub-page)
**Features:**
- Calendar picker to select date
- Shows recipes to be added
- Displays existing recipes for selected date
- Cancel and Save buttons in header
- Saves to Menu Calendar database on save

### 3. Menu Calendar Page
**Features:**
- Calendar view with marked dates (dots indicate planned meals)
- Select any date to view that day's menu
- Meals grouped by breakfast, lunch, dinner with color-coded headers
- Tap any recipe to see full details
- Empty state when no meals planned

### 4. Recipe Detail View
**Layout:**
- Recipe name card at top
- Meta information: time, meal type, difficulty
- Ingredients card with:
  - Ingredient name (prominent)
  - Property/category (subtle)
  - Quantity with unit (right side)
- Cooking process card with:
  - Numbered steps
  - Detailed instructions

### 5. Ingredients Page
**Features:**
- Search bar for filtering
- Add button (+) in top right
- Three-layer filtering:
  - Category tags (all, vegetable, fruit, meat, seafood, dairy)
  - Sorting options (name, quantity, expiration)
- Ingredient cards showing:
  - Name and category (left, prominent)
  - Quantity box (right, rounded)
  - Expiration date (below quantity)

**Add Ingredient Modal:**
- Name input
- Category selection
- Quantity and unit
- Shelf life in days (auto-calculates expiration)

### 6. Recipes Page
**Features:**
- Filter by meal type (all, breakfast, lunch, dinner)
- Filter by difficulty (all, easy, medium, difficult)
- Add button (+) for custom recipes
- Recipe cards showing:
  - Name (prominent)
  - Time and ingredient count
  - Meal type and difficulty tags (color-coded)

**Add Recipe Modal:**
- Recipe name and preparation time
- Meal type and difficulty selection
- Add ingredients (name, property, quantity, unit)
- Add cooking steps (numbered list)
- Save to recipe database

### 7. AI Cooking Assistant (Bot)
**Capabilities:**
- Recipe recommendations based on available ingredients
- Cooking tips and techniques
- Ingredient substitution suggestions
- Meal planning advice
- Interactive chat interface
- Context-aware responses

**Features:**
- Chat bubble interface
- User messages (right, red)
- Bot messages (left, white)
- Input field with send button
- Analyzes user's ingredient inventory
- Suggests matching recipes

## 🎨 Design System

### Color Palette
- **Primary Red**: #FF6B6B (main accent, dinner)
- **Teal**: #4ECDC4 (lunch)
- **Orange**: #FFB84D (breakfast)
- **Green**: #4CAF50 (easy difficulty)
- **Orange**: #FF9800 (medium difficulty)
- **Red**: #F44336 (difficult)
- **Background**: #F5F5F5
- **Card Background**: #FFFFFF
- **Text Primary**: #333333
- **Text Secondary**: #666666
- **Text Subtle**: #999999

### Typography
- **Headers**: 24-28px, bold
- **Subheaders**: 18-20px, semi-bold
- **Body**: 15-16px, regular
- **Small**: 13-14px, regular
- **Tiny**: 10-11px, bold (tags)

### Component Patterns
- **Cards**: White background, 12px border radius, subtle shadow
- **Tags**: Rounded rectangles, color-coded, uppercase text
- **Buttons**: Rounded, 10-30px radius depending on size
- **Input Fields**: 8px border radius, light border
- **Icons**: Ionicons library, 20-28px size

## 📊 Data Structure

### Recipe Object
```javascript
{
  id: string,
  name: string,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  difficulty: 'easy' | 'medium' | 'difficult',
  time: number (minutes),
  ingredients: [
    {
      name: string,
      property: string,
      quantity: string,
      unit: string
    }
  ],
  steps: string[]
}
```

### Ingredient Object
```javascript
{
  id: string,
  name: string,
  category: 'vegetable' | 'fruit' | 'meat' | 'seafood' | 'dairy',
  quantity: string,
  unit: string,
  shelfLifeDays: string,
  addedDate: string (ISO date),
  expirationDate: string (ISO date)
}
```

### Menu Calendar Object
```javascript
{
  'YYYY-MM-DD': [Recipe, Recipe, ...],
  'YYYY-MM-DD': [Recipe, ...]
}
```

## 🗂️ File Structure

```
whatoeat/
├── App.js                          # Main navigation setup
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── babel.config.js                 # Babel configuration
├── src/
│   ├── navigation/
│   │   └── HomeNavigator.js        # Home stack navigator
│   ├── screens/
│   │   ├── IntroScreen.js          # Welcome screen
│   │   ├── RecommendedMenuScreen.js # Daily menu
│   │   ├── AddToCalendarScreen.js  # Calendar picker
│   │   ├── RecipeDetailScreen.js   # Recipe details
│   │   ├── MenuCalendarScreen.js   # Calendar view
│   │   ├── IngredientsScreen.js    # Ingredient management
│   │   ├── RecipesScreen.js        # Recipe library
│   │   └── BotScreen.js            # AI assistant
│   ├── data/
│   │   └── mockRecipes.js          # Sample recipes
│   └── utils/
│       └── storage.js              # AsyncStorage wrapper
└── assets/                         # Images and icons
```

## 🔄 User Flows

### Flow 1: Plan a Meal
1. Open app → Intro screen
2. Tap "Generate Random Menu"
3. Browse 4 random recipes
4. Check desired recipes
5. Tap "Add to Menu Calendar"
6. Select date from calendar
7. Review existing meals for that date
8. Tap "Save"
9. Recipes added to calendar

### Flow 2: Add Ingredient
1. Go to Ingredients tab
2. Tap + button
3. Enter ingredient details
4. Select category
5. Enter quantity and unit
6. Enter shelf life days
7. Tap "Add"
8. Ingredient saved with auto-calculated expiration

### Flow 3: Create Recipe
1. Go to Recipes tab
2. Tap + button
3. Enter recipe name and time
4. Select meal type and difficulty
5. Add ingredients one by one
6. Add cooking steps in order
7. Tap "Save"
8. Recipe available in library and recommendations

### Flow 4: Get AI Recommendations
1. Add ingredients to inventory
2. Go to Bot tab
3. Ask "What can I make?"
4. Bot analyzes ingredients
5. Suggests matching recipes
6. User can ask follow-up questions

## 🚀 Technical Stack

- **Framework**: React Native 0.76.5
- **Platform**: Expo ~52.0.0
- **Navigation**: React Navigation 6.x
- **Storage**: AsyncStorage
- **UI Components**: React Native core + Expo Vector Icons
- **Calendar**: React Native Calendars
- **Language**: JavaScript (ES6+)

## 📦 Dependencies

```json
{
  "expo": "~52.0.0",
  "react": "18.3.1",
  "react-native": "0.76.5",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/stack": "^6.3.20",
  "react-native-calendars": "^1.1305.0",
  "@react-native-async-storage/async-storage": "2.1.0"
}
```

## 🎯 Future Enhancements

1. **Real AI Integration**: Connect to OpenAI or similar API
2. **Image Upload**: Add photos to recipes
3. **Shopping List**: Auto-generate from recipes
4. **Nutrition Info**: Calculate calories and macros
5. **Social Features**: Share recipes with friends
6. **Voice Input**: Talk to AI assistant
7. **Barcode Scanner**: Quick ingredient entry
8. **Recipe Import**: Import from websites
9. **Meal Prep Mode**: Batch cooking suggestions
10. **Dietary Filters**: Vegetarian, vegan, gluten-free, etc.

## 📝 Notes

- All data stored locally using AsyncStorage
- No backend required for basic functionality
- Mock recipes included for immediate testing
- AI assistant uses rule-based logic (can be upgraded to real AI)
- Fully functional offline
- Ready for Android deployment via Expo

## 🎓 Learning Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
