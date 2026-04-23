# Project Context: WhatToEat (Genote Ecosystem)

This document provides the current state, architecture, and development guidelines for the `WhatToEat` React Native (Expo) application. It is designed to be consumed by an AI agent (like Claude Code) to ensure continuity in development.

## 1. Project Overview
`WhatToEat` is a meal planning and ingredient management app. It integrates with **Supabase** for persistent cloud storage and **Google AI Studio (Gemini 2.0 Flash)** for AI-powered recipe generation and a cooking assistant chatbot.

### Core Goals Achieved:
- [x] Full integration with Supabase (Recipes, Ingredients, Menu Calendar).
- [x] Integration with Google AI Studio (Gemini) for Chatbot and Recipe generation.
- [x] Fixed SafeArea issues for Android/iOS (no top bar overlap).
- [x] Implemented 3-layer filtering for Ingredients.
- [x] Implemented AI-assisted recipe creation in the Recipes screen.

## 2. Tech Stack
- **Framework**: Expo (React Native)
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google AI Studio API (Gemini 2.0 Flash)
- **Styling**: Standard StyleSheet (Flexbox)
- **Environment**: `react-native-dotenv` for `.env` management

## 3. Data Model (Supabase Schema)
The database consists of 4 main tables:
- `recipes`: Core recipe info (`id`, `name`, `meal_type`, `difficulty`, `time`, `steps` [text array]).
- `recipe_ingredients`: Link table for recipes and their required ingredients.
- `ingredients`: User's inventory (`name`, `category`, `quantity`, `unit`, `added_date`, `shelf_life_days`, `expiration_date`, `source`).
- `menu_calendar`: Junction table linking `date`, `recipe_id`, and `meal_type`.

**Key Logic**:
- **Expiration Date**: Automatically calculated in Supabase via a trigger: `added_date + shelf_life_days`.
- **Data Transformation**: Services in `src/services/` transform Supabase `snake_case` to frontend `camelCase`.

## 4. Key Services
- `src/services/aiService.js`: Handles Gemini API calls. Supports `chat` (with context injection) and `generateRecipe`.
- `src/services/recipeService.js`: CRUD for recipes. Includes `transformArrayToFrontend` to ensure UI consistency.
- `src/services/ingredientService.js`: CRUD for inventory. Includes filtering and sorting logic.
- `src/services/menuCalendarService.js`: Handles date-based meal planning.

## 5. Screen Specifications

### 5.1 Home Page (Two-Phase Flow)

#### Phase 1: Introduction Screen (First View on App Open)
- Displays an illustrated image with welcoming design.
- A single button: **"Generate Random Menu"**.
- Clicking the button transitions to Phase 2 (Recommended Menu view).

#### Phase 2: Recommended Menu View
- **Menu List**: Generates random recipes covering **Breakfast, Lunch, and Dinner**.
  - Each item card layout:
    - **Left**: Meal type label (Breakfast/Lunch/Dinner) with distinct color coding.
    - **Center (Prominent)**: Delicacy name — the most visually dominant element.
    - **Below Name**: Predicted cooking time (e.g., "30 minutes") + Difficulty (Easy/Medium/Difficult).
    - **Right**: Checkbox for selection.
- **Two Action Buttons** below the menu list:
  1. **"Add to Menu Calendar"**: Disabled by default. Enabled when one or more items are checked.
  2. **"Switch Menu"**: Generates a new random list of delicacies from the recipe database.

#### Add to Calendar Subpage (Secondary Page)
- **Header**: Cancel button (top-left) + Save button (top-right).
- **Content**:
  - Calendar date picker at the top.
  - Below calendar: Selected delicacy items displayed as small cards (same visual style as menu list, but without checkboxes).
  - If the chosen date already has planned meals, those existing items are shown separately below the new items, clearly distinguished as "already added".
- **Actions**:
  - **Save**: Persists items to the `menu_calendar` database, synced with the Menu Calendar page.
  - **Cancel**: Discards and returns to Home.

### 5.2 Menu Calendar Page
- **Calendar View**: Interactive calendar (`react-native-calendars`) with visual indicators for dates that have planned meals.
- **Daily Menu Display** (below calendar for selected date):
  - Meal cards grouped by meal type (Breakfast/Lunch/Dinner) — meal type is the **most prominent** visual element.
  - Delicacy names shown as bullet points under each meal type.
  - Clicking a meal card navigates to the Recipe Detail View.

#### Recipe Detail View (Secondary Page)
Three full-width cards stacked vertically:

1. **Delicacy Name Card (Top)**:
   - Delicacy name — prominent display.
   - Below name: Predicted cooking time.
   - Right side: Meal type (Breakfast/Lunch/Dinner) + Difficulty level (Easy/Medium/Difficult).

2. **Ingredients Card**:
   - Each ingredient row:
     - **Left**: Ingredient name (prominent) + property description in subdued color (e.g., "bacon — meat", "lettuce — vegetable").
     - **Right**: Quantity/amount needed.

3. **Cooking Process Card**:
   - Numbered list format with step-by-step detailed instructions.

- **Edit button** on the top-right corner of this page.

### 5.3 Ingredients Page
- **Header**: "Ingredients" title (top-left) + "+" Add button (top-right).
- **Search Bar**: Below the title, search by ingredient name.

#### 3-Layer Classification Filters
1. **Layer 1 — Item Scope**: All Ingredients / My Ingredients / Recipe Ingredients.
2. **Layer 2 — Category**: All / Vegetables / Fruits / Meat / Seafood / etc.
3. **Layer 3 — Sorting**: By Quantity / By Name / By Shelf Life (Expiration).

#### Ingredient Card Layout
- **Left Side (Dominant)**:
  - Name (e.g., "Apple", "Pork Belly") — primary visual element.
  - Description line below in subdued color (e.g., "Fruit", "Meat").
- **Right Side**:
  - Rounded rectangle box showing quantity number + unit (e.g., "5 pcs", "2 kg").
  - Expiration date below quantity (e.g., "October 31st, 2025").
- Highlighting for **expired** (past due) and **expiring-soon** items.

#### Ingredient Attributes (Data Model)
Each ingredient has:
1. **Category**: Classification (Fruit, Vegetable, Meat, Seafood, etc.).
2. **Quantity**: Amount in storage with editable unit (piece, box, kg, bunch, etc.).
3. **Shelf Life**: User-defined duration in days (e.g., 14 days). Expiration date = `added_date + shelf_life_days`, auto-calculated and stored in database.

#### Add Ingredient Modal
Fields: Name, Category, Quantity (number + unit), Shelf Life (days).

### 5.4 Recipes Page
- **Header**: "Recipes" title (top-left) + "+" Add button (top-right).

#### Category Filters
- **Meal Type**: All / Breakfast / Lunch / Dinner.
- **Difficulty**: All / Easy / Medium / Difficult.

#### Recipe Card Layout
- **Left Side (Prominent)**:
  - Dish name — most prominent element.
  - Cooking time in subdued text (e.g., "30 mins").
  - Ingredient count (e.g., "8 ingredients").
- **Right Side**:
  - Meal type tag (color-coded: Breakfast/Lunch/Dinner).
  - Difficulty level below (Easy/Medium/Difficult).
- Clicking a card opens the **Recipe Detail View** (same format as Menu Calendar detail view — 3 cards).

#### Add Recipe Modal
Fields: Dish Name, Preparation Time, Difficulty, Meal Type, Required Ingredients (list), Cooking Steps (numbered list).
- **AI Button**: Input a dish name, and AI (Gemini) auto-generates required ingredients, estimated cooking time, and preparation steps.

**Database Note**: The recipe database is the **same** database used by the Home page's random menu generator. They are fully connected.

### 5.5 Bot Page (AI Assistant)
- Chat interface powered by **Gemini 2.0 Flash**.
- **Context Injection**: Automatically sends current ingredient inventory and recipe library to AI for personalized, context-aware advice.
- **Capabilities**:
  1. Answer cooking, recipe, and ingredient-related questions.
  2. Understand the full app context (ingredients on hand, planned menus, recipes).
  3. Recommend recipes based on user's existing ingredients (especially those expiring soon).
  4. Generate complete recipes (ingredients + steps) that can be **saved directly** to the recipe library.
- **Example Use Cases**:
  - "What can I cook with chicken and broccoli?"
  - "Recommend a medium-difficulty dinner."
  - "What recipes use ingredients expiring soon?"

## 6. Development Guidelines for AI Agent
- **SafeArea**: Always use `SafeAreaView` from `react-native-safe-area-context` with `edges={['top']}` for main screens to avoid notch overlap.
- **Environment Variables**: Access `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GEMINI_API_KEY` via `@env`.
- **Error Handling**: Use `SupabaseService.execute` wrapper for database calls to ensure consistent error reporting.
- **Data Shape**: Always use the `transformToFrontend` methods in services when fetching data from Supabase to maintain `camelCase` in components.

## 7. Current TODOs / Next Steps
- [ ] **Chatbot Parsing**: Refine the `parseRecipeFromChat` regex in `aiService.js` to more reliably extract JSON from conversational text.
- [ ] **Image Support**: Add support for recipe images (Supabase Storage integration).
- [ ] **Push Notifications**: Notify users when ingredients are about to expire.
- [ ] **UI Polish**: Improve the "Add to Calendar" modal UI in the Home screen to match the PRD's "Calendar Page" aesthetics more closely.
- [ ] **Legacy Cleanup**: The `src/screens/IntroScreen.js` and `src/navigation/HomeNavigator.js` still point to an intro screen. Consider if this should be removed for a more direct entry.

## 8. Critical Files to Watch
- `src/config/supabase.js`: Client initialization.
- `src/services/aiService.js`: AI prompt engineering and API logic.
- `.env`: API credentials (do not commit to public repos).
- `supabase/schema.sql`: Source of truth for database structure.
