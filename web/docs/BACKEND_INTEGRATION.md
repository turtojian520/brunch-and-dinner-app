# WhatToEat App - Backend Integration Guide

## Overview

The WhatToEat app has been successfully integrated with Supabase as the backend database, replacing the previous AsyncStorage-only implementation. This enables cloud sync, data persistence across devices, and prepares the app for future features.

## What Was Implemented

### 1. Database Schema

Created a complete PostgreSQL schema in Supabase with the following tables:

- **recipes** - Stores recipe information (name, meal type, difficulty, cooking time, steps)
- **recipe_ingredients** - Join table linking recipes to their ingredients
- **ingredients** - User's ingredient inventory with expiration tracking
- **menu_calendar** - Planned meals by date

**Features:**
- Auto-calculated expiration dates using database triggers
- Indexes for optimized filtering and sorting
- Foreign key constraints for data integrity
- Seed data from mockRecipes

**Location:** `supabase/schema.sql`

### 2. Service Layer

Created a comprehensive service layer for all database operations:

**Base Service** (`src/services/supabaseService.js`):
- Centralized error handling
- Response standardization
- Configuration checking

**Domain Services:**

- **RecipeService** (`src/services/recipeService.js`):
  - CRUD operations for recipes
  - Random recipe selection for daily menu
  - Filtering by meal type and difficulty
  - Data transformation between Supabase and frontend formats

- **IngredientService** (`src/services/ingredientService.js`):
  - Ingredient inventory management
  - Filtering by category and source
  - Sorting by name, quantity, expiration
  - Expiring soon queries

- **MenuCalendarService** (`src/services/menuCalendarService.js`):
  - Add/remove recipes from calendar
  - Query by date or date range
  - Get marked dates for calendar visualization
  - Grouped menu by meal type

### 3. Configuration

**Babel Configuration** (`babel.config.js`):
- Added react-native-dotenv plugin for environment variables

**Supabase Client** (`src/config/supabase.js`):
- Singleton Supabase client instance
- Environment variable validation
- Configuration checking utility

**Environment Variables** (`.env`):
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Data Migration

Created migration utility (`src/utils/dataMigration.js`) with:
- One-time migration from AsyncStorage to Supabase
- Automatic database initialization with mock recipes
- Progress tracking and error handling
- Migration status persistence

### 5. Frontend Integration

Updated all screens to use Supabase services:

**RecommendedMenuScreen:**
- Loads recipes from Supabase
- Auto-initializes database with mock data
- Loading states and error handling
- Fallback to mock data if Supabase unavailable

**RecipesScreen:**
- CRUD operations via RecipeService
- Creates recipes in Supabase
- Filters work with cloud data

**IngredientsScreen:**
- Ingredient management via IngredientService
- Server-side expiration calculation
- Recipe ingredients extracted from Supabase

**MenuCalendarScreen:**
- Loads planned meals from Supabase
- Marked dates from cloud
- Real-time updates

**AddToCalendarScreen:**
- Saves menu entries to Supabase
- Shows existing entries for date
- Batch insertion support

**BotScreen:**
- Uses services to load context data
- Recipe recommendations from Supabase

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `whatoeat`
   - Database Password: (save securely)
   - Region: Choose closest to your location
4. Click "Create new project"

### Step 2: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Verify tables in **Table Editor**

### Step 3: Get API Credentials

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 4: Configure Environment Variables

1. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

**IMPORTANT:** Never commit `.env` to git! It's already in `.gitignore`.

### Step 5: Install Dependencies

Dependencies are already installed:
- `@supabase/supabase-js` - Supabase client
- `react-native-dotenv` - Environment variables

If needed:
```bash
npm install
```

### Step 6: Run the App

```bash
# Start Expo development server
npm start

# Or run directly on Android
npm run android
```

## How It Works

### Data Flow

1. **App Startup:**
   - Supabase client initializes with environment variables
   - Screens load data from Supabase via services
   - If database is empty, mock recipes are auto-inserted

2. **User Actions:**
   - Add recipe → RecipeService.createRecipe() → Supabase
   - Add ingredient → IngredientService.createIngredient() → Supabase
   - Add to calendar → MenuCalendarService.addRecipeToMenu() → Supabase

3. **Data Display:**
   - Services fetch from Supabase
   - Transform Supabase format to frontend format
   - Update React state
   - UI re-renders

### Offline Support

- App falls back to mock data if Supabase unavailable
- Loading states show user when data is fetching
- Error messages inform user of connection issues

### Data Transformation

Supabase uses snake_case (e.g., `meal_type`, `recipe_ingredients`)
Frontend uses camelCase (e.g., `mealType`, `ingredients`)

Services handle transformation automatically:
- `transformToFrontend()` - Supabase → Frontend
- `transformArrayToFrontend()` - Array transformation

## Testing

### Manual Testing Checklist

**Recipes:**
- [x] Load recipes from Supabase
- [x] Generate random menu
- [x] Add new recipe
- [x] Filter by meal type and difficulty
- [x] View recipe details

**Ingredients:**
- [x] Load ingredients from Supabase
- [x] Add new ingredient
- [x] Filter by category
- [x] Sort by name/quantity/expiration
- [x] Search by name

**Menu Calendar:**
- [x] View planned meals by date
- [x] Add recipes to calendar
- [x] See marked dates
- [x] View existing entries when adding

**General:**
- [x] Mock data auto-loads on first run
- [x] Loading states display correctly
- [x] Error messages show when offline

### Verify in Supabase Dashboard

1. Go to **Table Editor**
2. Check `recipes` table has data
3. Add a recipe in app
4. Refresh table - new recipe should appear
5. Check `menu_calendar` table after adding to calendar

## File Structure

```
whatoeat/
├── supabase/
│   ├── schema.sql                    # Database schema
│   └── README.md                     # Supabase setup guide
├── src/
│   ├── config/
│   │   └── supabase.js              # Supabase client config
│   ├── services/
│   │   ├── supabaseService.js       # Base service
│   │   ├── recipeService.js         # Recipe operations
│   │   ├── ingredientService.js     # Ingredient operations
│   │   └── menuCalendarService.js   # Calendar operations
│   ├── utils/
│   │   ├── storage.js               # AsyncStorage wrapper (legacy)
│   │   └── dataMigration.js         # Migration utility
│   └── screens/
│       ├── RecommendedMenuScreen.js # Updated
│       ├── RecipesScreen.js         # Updated
│       ├── IngredientsScreen.js     # Updated
│       ├── MenuCalendarScreen.js    # Updated
│       ├── AddToCalendarScreen.js   # Updated
│       └── BotScreen.js             # Updated
├── .env.example                      # Environment template
├── .env                              # Your credentials (not in git)
├── babel.config.js                   # Babel config with dotenv
└── BACKEND_INTEGRATION.md            # This file
```

## Troubleshooting

### "Supabase not configured" error

**Problem:** App shows "Supabase not configured" warning

**Solution:**
1. Check `.env` file exists in project root
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY are set
3. Restart Expo dev server after changing .env
4. Clear cache: `npx expo start --clear`

### No data showing

**Problem:** App loads but shows no recipes/ingredients

**Solution:**
1. Check Supabase connection in dashboard
2. Verify SQL schema was run successfully
3. Check browser console/terminal for errors
4. Verify tables have data in Supabase Table Editor

### TypeError: Cannot read property 'recipe_ingredients'

**Problem:** Error when loading recipes

**Solution:**
- Database schema may not have been run
- Run `supabase/schema.sql` in SQL Editor
- Verify `recipe_ingredients` table exists

### App works offline but doesn't sync to Supabase

**Problem:** Data saves locally but not to cloud

**Solution:**
1. Check network connection
2. Verify Supabase URL is correct
3. Check Supabase dashboard for project status
4. Verify API key is correct (anon/public key, not service_role)

## Security Notes

**Current Setup:**
- No Row Level Security (RLS)
- Public read/write access with API key
- Suitable for development and single-user testing

**For Production:**
1. Enable Supabase Authentication
2. Implement RLS policies
3. Add user_id column to all tables
4. Restrict data access per user

## Future Enhancements

Completed backend integration enables:

1. **User Authentication**
   - Supabase Auth integration
   - Per-user data isolation
   - Social login support

2. **Real-time Sync**
   - Live updates across devices
   - Collaborative meal planning
   - Real-time notifications

3. **AI Integration**
   - Connect BotScreen to AI API
   - Generate recipes with AI
   - Smart ingredient-based recommendations

4. **Cloud Storage**
   - Upload recipe photos
   - Share recipes with users
   - Backup and restore

5. **Analytics**
   - Track popular recipes
   - Usage statistics
   - Meal planning patterns

## API Reference

### RecipeService

```javascript
// Get all recipes
const { success, data, error } = await RecipeService.getAllRecipes();

// Create recipe
const result = await RecipeService.createRecipe({
  name: 'Pasta',
  mealType: 'dinner',
  difficulty: 'easy',
  time: 20,
  ingredients: [{ name: 'Pasta', property: 'grain', quantity: '200', unit: 'g' }],
  steps: ['Boil water', 'Cook pasta']
});

// Get random recipes
const { data } = await RecipeService.getRandomRecipes(4);
```

### IngredientService

```javascript
// Get all ingredients
const { data } = await IngredientService.getAllIngredients();

// Add ingredient
const result = await IngredientService.createIngredient({
  name: 'Tomato',
  category: 'vegetable',
  quantity: '5',
  unit: 'pcs',
  shelfLifeDays: '7'
});

// Get expiring soon
const { data } = await IngredientService.getExpiringSoon(7);
```

### MenuCalendarService

```javascript
// Get menu for date
const { data } = await MenuCalendarService.getGroupedMenuByDate('2026-01-25');

// Add to calendar
const result = await MenuCalendarService.addRecipeToMenu(
  '2026-01-25',
  'recipe-uuid',
  'breakfast'
);

// Get marked dates
const { data } = await MenuCalendarService.getMarkedDates();
```

## Support

For issues or questions:
1. Check Supabase dashboard logs
2. Check React Native console logs
3. Verify environment variables
4. Test database connection in Supabase SQL Editor

## License

This project is part of the WhatToEat app.
Created: 2026-01-25
