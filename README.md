# WhatToEat - Your Daily Meal Companion

A React Native mobile app for iOS and Android that helps you plan meals, manage ingredients, discover recipes, and get cooking assistance with cloud-powered backend.

## Features

### 🏠 Home Page
- **Introduction Screen**: Welcome screen with "Generate Random Menu" button
- **Daily Recommended Menu**: Randomly fetched delicacies from the recipe database
- **Smart Selection**: Checkbox system to select recipes
- **Add to Calendar**: Save selected recipes to specific dates
- **Refresh Menu**: Generate new random recommendations

### 📅 Menu Calendar
- **Calendar View**: Visual calendar to browse dates
- **Daily Menu Display**: View meals organized by breakfast, lunch, and dinner
- **Recipe Details**: Tap any recipe to see full cooking instructions
- **Meal Planning**: Track what you'll eat each day

### 🥬 Ingredients
- **Ingredient Database**: Store all your ingredients with details
- **Smart Categorization**: Organize by vegetable, fruit, meat, seafood, dairy
- **Expiration Tracking**: Automatic calculation of expiration dates
- **Quantity Management**: Track amounts with custom units
- **Search & Filter**: Find ingredients quickly
- **Sorting Options**: Sort by name, quantity, or expiration date

### 📖 Recipes
- **Recipe Library**: Browse all available recipes
- **Filter by Meal Type**: Breakfast, lunch, or dinner
- **Filter by Difficulty**: Easy, medium, or difficult
- **Add Custom Recipes**: Create your own recipes with ingredients and steps
- **Detailed View**: See ingredients needed and step-by-step cooking process

### 🤖 AI Cooking Assistant
- **Recipe Recommendations**: Get suggestions based on your available ingredients
- **Cooking Tips**: Learn cooking techniques and methods
- **Ingredient Substitutions**: Find alternatives for missing ingredients
- **Meal Planning Help**: Get advice on balanced meal planning
- **Interactive Chat**: Ask any cooking-related questions

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- **For Android**: Android Studio or physical Android device
- **For iOS**: Xcode, CocoaPods, macOS required
- **Supabase Account**: For cloud backend (free tier available)

### Quick Start

1. **Navigate to the project directory**:
   ```bash
   cd "op.2_brunch&dinner/whatoeat"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase Backend** (See [QUICK_START.md](QUICK_START.md)):
   - Create Supabase project at [supabase.com](https://supabase.com)
   - Run `supabase/schema.sql` in SQL Editor
   - Create `.env` file with your credentials:
     ```
     SUPABASE_URL=your-project-url
     SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Run on Android**:
   ```bash
   npm run android
   # Or: npx expo start then press 'a'
   ```

5. **Run on iOS** (macOS only):
   ```bash
   # Option 1: Automatic setup
   ./setup-ios.sh

   # Option 2: Manual build
   npx expo run:ios
   ```

   **Having iOS issues?** → See [FIX_IOS_NOW.md](FIX_IOS_NOW.md) for troubleshooting

## Project Structure

```
whatoeat/
├── App.js                          # Main app entry with navigation
├── src/
│   ├── navigation/
│   │   └── HomeNavigator.js        # Home stack navigation
│   ├── screens/
│   │   ├── IntroScreen.js          # Welcome/intro screen
│   │   ├── RecommendedMenuScreen.js # Daily menu recommendations
│   │   ├── AddToCalendarScreen.js  # Calendar date picker
│   │   ├── RecipeDetailScreen.js   # Recipe details view
│   │   ├── MenuCalendarScreen.js   # Calendar main page
│   │   ├── IngredientsScreen.js    # Ingredients management
│   │   ├── RecipesScreen.js        # Recipe library
│   │   └── BotScreen.js            # AI assistant chat
│   ├── data/
│   │   └── mockRecipes.js          # Sample recipe database
│   └── utils/
│       └── storage.js              # AsyncStorage utilities
├── package.json
└── app.json
```

## Usage Guide

### Adding Ingredients
1. Go to Ingredients tab
2. Tap the + button
3. Fill in ingredient details (name, category, quantity, shelf life)
4. Save to add to your inventory

### Planning Meals
1. Open the app to see the intro screen
2. Tap "Generate Random Menu"
3. Check the recipes you want to add
4. Tap "Add to Menu Calendar"
5. Select a date and save

### Creating Recipes
1. Go to Recipes tab
2. Tap the + button
3. Enter recipe name, time, meal type, and difficulty
4. Add ingredients one by one
5. Add cooking steps in order
6. Save the recipe

### Using the AI Assistant
1. Go to Bot tab
2. Ask questions like:
   - "What can I make with my ingredients?"
   - "How do I substitute eggs?"
   - "Give me meal planning tips"
3. Get instant cooking advice and recommendations

## Technologies Used

### Frontend
- **React Native**: Cross-platform mobile framework
- **Expo SDK 52**: Development platform and tools
- **React Navigation**: Navigation library
- **React Native Calendars**: Calendar component
- **Expo Vector Icons**: Icon library

### Backend
- **Supabase**: Cloud PostgreSQL database
- **PostgreSQL**: Relational database with auto-calculated fields
- **Row Level Security**: Data protection (configurable)

### Data Management
- **Service Layer**: Clean separation of concerns
- **Data Transformation**: Automatic snake_case ↔ camelCase conversion
- **Offline Support**: Fallback to local data

## Color Scheme

- **Breakfast**: Orange (#FFB84D)
- **Lunch**: Teal (#4ECDC4)
- **Dinner**: Red (#FF6B6B)
- **Easy**: Green (#4CAF50)
- **Medium**: Orange (#FF9800)
- **Difficult**: Red (#F44336)

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - 10-minute setup guide
- **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** - Complete backend documentation
- **[FIX_IOS_NOW.md](FIX_IOS_NOW.md)** - iOS simulator troubleshooting
- **[IOS_SETUP.md](IOS_SETUP.md)** - Detailed iOS setup guide
- **[CLAUDE.MD](CLAUDE.MD)** - Original project specification
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Development summary

## Completed Features ✅

- ✅ Cloud-synced data with Supabase
- ✅ iOS and Android support
- ✅ Recipe management (CRUD operations)
- ✅ Ingredient inventory with expiration tracking
- ✅ Menu calendar with date-based planning
- ✅ AI cooking assistant (pattern-based)
- ✅ Offline fallback mode
- ✅ Auto-initialization with sample data

## Future Enhancements

- User authentication with Supabase Auth
- Real AI API integration (OpenAI/Anthropic)
- Photo upload for recipes (Supabase Storage)
- Shopping list generation
- Nutritional information
- Social sharing and recipe ratings
- Real-time sync across devices
- Voice input for AI assistant
- Push notifications for meal planning

## License

This project is for educational purposes.
