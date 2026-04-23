# WhatToEat App Structure

## Navigation Hierarchy

```
App (Bottom Tab Navigator)
├── Home Tab (Stack Navigator)
│   ├── IntroScreen (Initial)
│   ├── RecommendedMenuScreen
│   ├── AddToCalendarScreen (Modal)
│   └── RecipeDetailScreen
│
├── Calendar Tab
│   └── MenuCalendarScreen
│       └── → RecipeDetailScreen (via Home stack)
│
├── Ingredients Tab
│   └── IngredientsScreen
│       └── Add Ingredient Modal
│
├── Recipes Tab
│   └── RecipesScreen
│       ├── Add Recipe Modal
│       └── → RecipeDetailScreen (via Home stack)
│
└── Bot Tab
    └── BotScreen (AI Chat)
```

## Screen Breakdown

### 1. IntroScreen
```
┌─────────────────────────┐
│                         │
│       🍳🥗🍝            │
│                         │
│    What To Eat         │
│  Your daily meal       │
│    companion           │
│                         │
│  ┌─────────────────┐   │
│  │ Generate Random │   │
│  │      Menu       │   │
│  └─────────────────┘   │
│                         │
└─────────────────────────┘
```

### 2. RecommendedMenuScreen
```
┌─────────────────────────┐
│ Today's Recommended     │
│ Menu                    │
├─────────────────────────┤
│ ┌───────────────────┐ │ │
│ │[B] Scrambled Eggs │ ☐ │
│ │    10 mins • easy │   │
│ └───────────────────┘   │
│ ┌───────────────────┐ │ │
│ │[L] Chicken Stir   │ ☐ │
│ │    25 mins • med  │   │
│ └───────────────────┘   │
│ ┌───────────────────┐ │ │
│ │[D] Spaghetti      │ ☑ │
│ │    30 mins • med  │   │
│ └───────────────────┘   │
├─────────────────────────┤
│ [Add to Calendar]       │
│ [Generate New Menu]     │
└─────────────────────────┘
```

### 3. AddToCalendarScreen
```
┌─────────────────────────┐
│ Cancel  Add to  Save    │
│         Calendar        │
├─────────────────────────┤
│   [Calendar Widget]     │
│   Jan 2026              │
│   S M T W T F S         │
│         1 2 3 4         │
│   5 6 7 8 ●...         │
├─────────────────────────┤
│ Recipes to Add:         │
│ ┌───────────────────┐   │
│ │[D] Spaghetti      │   │
│ │    30 mins • med  │   │
│ └───────────────────┘   │
│                         │
│ Already Added:          │
│ ┌───────────────────┐   │
│ │[B] Avocado Toast  │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

### 4. MenuCalendarScreen
```
┌─────────────────────────┐
│ Menu Calendar           │
├─────────────────────────┤
│   [Calendar Widget]     │
│   ● = has meals         │
├─────────────────────────┤
│ Menu for 2026-01-08     │
│                         │
│ ┌─────────────────────┐ │
│ │ BREAKFAST           │ │
│ │ • Scrambled Eggs    │ │
│ │ • Avocado Toast     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ LUNCH               │ │
│ │ • Chicken Stir Fry  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ DINNER              │ │
│ │ • Spaghetti         │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 5. RecipeDetailScreen
```
┌─────────────────────────┐
│ ← Back                  │
├─────────────────────────┤
│ Spaghetti Carbonara     │
│ ⏱ 30 mins [L] [MED]    │
├─────────────────────────┤
│ Ingredients             │
│ ┌─────────────────────┐ │
│ │ Spaghetti      400g │ │
│ │ Property: pasta     │ │
│ ├─────────────────────┤ │
│ │ Bacon          200g │ │
│ │ Property: meat      │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Cooking Process         │
│ ┌─────────────────────┐ │
│ │ ① Cook spaghetti    │ │
│ │   according to...   │ │
│ ├─────────────────────┤ │
│ │ ② Dice bacon and    │ │
│ │   fry until crispy  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 6. IngredientsScreen
```
┌─────────────────────────┐
│ Ingredients          +  │
├─────────────────────────┤
│ 🔍 Search...            │
├─────────────────────────┤
│ [all][veg][fruit][meat] │
│ [Name][Qty][Expiration] │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Apple          ┌──┐ │ │
│ │ Fruit          │5 │ │ │
│ │                └──┘ │ │
│ │            2026-01-15│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Chicken        ┌──┐ │ │
│ │ Meat           │2 │ │ │
│ │                └──┘ │ │
│ │            2026-01-10│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 7. RecipesScreen
```
┌─────────────────────────┐
│ Recipes              +  │
├─────────────────────────┤
│ Meal: [all][B][L][D]    │
│ Diff: [all][E][M][H]    │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Scrambled Eggs  [B] │ │
│ │ 10 mins        [E]  │ │
│ │ 4 ingredients       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Chicken Stir    [L] │ │
│ │ 25 mins        [M]  │ │
│ │ 5 ingredients       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Spaghetti       [D] │ │
│ │ 30 mins        [M]  │ │
│ │ 5 ingredients       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 8. BotScreen
```
┌─────────────────────────┐
│ 💬 Cooking Assistant    │
├─────────────────────────┤
│                         │
│ ┌─────────────────┐     │
│ │ Hi! I'm your    │     │
│ │ cooking assist. │     │
│ └─────────────────┘     │
│                         │
│     ┌─────────────────┐ │
│     │ What can I make │ │
│     │ with chicken?   │ │
│     └─────────────────┘ │
│                         │
│ ┌─────────────────┐     │
│ │ Based on your   │     │
│ │ ingredients...  │     │
│ └─────────────────┘     │
│                         │
├─────────────────────────┤
│ Ask me anything... [→] │
└─────────────────────────┘
```

## Data Flow

```
User Actions → Screen Components → Storage Utils → AsyncStorage
                                                        ↓
                                                    Persisted Data
                                                        ↓
                                                    Retrieved on Load
```

### Storage Keys
- `@recipes` - All recipes (including mock + user-added)
- `@ingredients` - User's ingredient inventory
- `@menu_calendar` - Planned meals by date

## Component Reusability

### Shared Components (Potential Extraction)
- RecipeCard (used in multiple screens)
- MealTypeTag (color-coded tags)
- DifficultyTag (difficulty indicators)
- IngredientItem (ingredient list items)
- StepItem (cooking step items)

### Shared Utilities
- `getMealTypeColor(mealType)` - Returns color for meal type
- `getDifficultyColor(difficulty)` - Returns color for difficulty
- `storage.js` - AsyncStorage wrapper functions

## State Management

Currently using:
- **Local State**: `useState` for component-level state
- **Navigation State**: React Navigation for screen params
- **Persistent State**: AsyncStorage for data persistence
- **Effect Hooks**: `useEffect` for data loading
- **Focus Hooks**: `useIsFocused` for refresh on tab focus

## Key Features by Screen

| Screen | Add | Edit | Delete | Filter | Sort | Search |
|--------|-----|------|--------|--------|------|--------|
| Intro | - | - | - | - | - | - |
| Recommended | - | - | - | - | - | - |
| Add to Calendar | ✓ | - | - | - | - | - |
| Recipe Detail | - | - | - | - | - | - |
| Menu Calendar | - | - | - | ✓ | - | - |
| Ingredients | ✓ | - | - | ✓ | ✓ | ✓ |
| Recipes | ✓ | - | - | ✓ | - | - |
| Bot | - | - | - | - | - | - |

## Bottom Tab Icons

- Home: `home` / `home-outline`
- Calendar: `calendar` / `calendar-outline`
- Ingredients: `nutrition` / `nutrition-outline`
- Recipes: `book` / `book-outline`
- Bot: `chatbubbles` / `chatbubbles-outline`
