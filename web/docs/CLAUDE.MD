# WhatToEat App - Project Specification

## Project Overview
A React Native/Expo mobile application for Android that helps users plan meals, manage ingredients, and discover recipes with AI assistance.

---

## 1. Home Page

### Introduction Screen (First Launch)
- **Initial View**: Illustrated image with welcoming design
- **Primary Action**: "Generate Random Menu" button
- **Behavior**: Clicking the button redirects to the Recommended Menu view

### Recommended Menu View

#### Daily Menu List
Each delicacy item displays:
- **Left Side**: Meal type label (Breakfast/Lunch/Dinner) with distinct colors
- **Center (Prominent)**: Delicacy name (highlighted as main element)
- **Below Name**:
  - Predicted cooking time (e.g., "30 minutes")
  - Difficulty level (Easy/Medium/Difficult)
- **Right Side**: Checkbox for selection

#### Action Buttons
1. **"Add to Menu Calendar"**
   - Initially disabled
   - Enabled when one or more items are checked
   - Opens calendar selection subpage

2. **"Switch Menu"**
   - Generates a new random list of delicacies
   - Fetches from the delicacies database

---

## 2. Add to Menu Calendar Flow

### Calendar Selection Subpage

#### Header
- **Top Left**: Cancel button
- **Top Right**: Save button

#### Content
- **Calendar Viewer**: Date selection interface
- **Selected Items**:
  - Display checked delicacies in small card format
  - Similar visual style to recommended menu list
  - No checkboxes
- **Existing Items**:
  - Show delicacies already added for the selected date
  - Same card visual style
  - Clearly separated from new items

#### Actions
- **Save**: Adds items to Menu Calendar database
- **Cancel**: Discards changes and returns to Home

---

## 3. Menu Calendar Page

### Calendar View
- Interactive calendar for date selection
- Visual indicators for dates with planned meals

### Daily Menu Display
Below the calendar, show meal cards for the selected date:

#### Meal Card Layout
- **Most Prominent**: Meal type (Breakfast/Lunch/Dinner)
- **Bullet Points**: Delicacy names under each meal type
- **Interactive**: Click card to view recipe details

### Recipe Detail View (Secondary Page)

#### Top Section Card
- **Delicacy Name**: Prominent display
- **Below Name**: Predicted cooking time
- **Right Side**:
  - Meal type (Breakfast/Lunch/Dinner)
  - Difficulty level (Easy/Medium/Difficult)

#### Ingredients Card (Full Width)
Each ingredient shows:
- **Left Side**:
  - Ingredient name (prominent)
  - Property description in subdued color (e.g., "bacon - meat", "lettuce - vegetable")
- **Right Side**: Quantity/amount needed

#### Cooking Process Card (Full Width)
- Numbered list format
- Step-by-step detailed instructions
- Clear, specific directions

---

## 4. Ingredients Page

### Header
- **Top Left**: "Ingredients" title
- **Top Right**: "+" Add button

### Search Bar
- Below the title
- Search ingredients by name

### Classification Layers

#### First Layer: Item Scope
- All Ingredients
- My Ingredients
- Recipe Ingredients

#### Second Layer: Category Type
- All Categories
- Vegetables
- Fruits
- Meat
- Seafood
- (Other categories as needed)

#### Third Layer: Sorting
- Sort by Quantity
- Sort by Name
- Sort by Shelf Life/Expiration

### Ingredient Card Layout
**Left Side (Dominant)**:
- **Name**: Ingredient name (e.g., "Apple", "Pork Belly")
- **Description**: Category/attribute (e.g., "Fruit", "Meat") in subdued color

**Right Side**:
- **Quantity Box**: Rounded rectangle with number + unit (e.g., "5 pcs", "2 kg")
- **Expiration Date**: Below quantity (e.g., "October 31st, 2025")

### Ingredient Attributes
Each ingredient item has:
1. **Category**: General classification (fruit, vegetable, meat, etc.)
2. **Quantity**: Amount in refrigerator with editable quantifier (piece, box, kg, etc.)
3. **Shelf Life**:
   - User sets shelf life duration when adding (e.g., 14 days)
   - System calculates expiration date = added date + shelf life
   - Stored in database as final expiration date

### Add Ingredient Interface
Clicking "+" button allows adding:
- Ingredient name
- Category
- Quantity (number + unit)
- Shelf life (duration in days)

---

## 5. Recipe Page

### Header
- **Top Left**: "Recipes" title
- **Top Right**: "+" Add button

### Categories

#### Meal Type Filter
- All
- Breakfast
- Lunch
- Dinner

#### Difficulty Filter
- All
- Easy
- Medium
- Difficult

### Recipe Card Layout
**Left Side (Prominent)**:
- **Name**: Dish name (most prominent)
- **Time**: Preparation time (e.g., "30 mins") in subdued color
- **Ingredients Count**: Number of required ingredients (e.g., "8 ingredients")

**Right Side**:
- **Meal Type Tag**: Color-coded (Breakfast/Lunch/Dinner)
- **Difficulty Indicator**: Easy/Medium/Difficult

### Add Recipe Interface
Clicking "+" button allows adding:
- Dish Name
- Preparation Time
- Difficulty Level
- Meal Type
- Required Ingredients (list)
- Cooking Steps (numbered list)

### AI Integration (Optional Feature)
- Input dish name
- AI auto-generates:
  - Required ingredients
  - Estimated cooking time
  - Preparation steps

### Recipe Detail View
Clicking a recipe card shows:
- All recipe information (same format as Menu Calendar detail view)
- Required ingredients
- Preparation time
- Cooking process

---

## 6. Bot Page

### AI Assistant Features
The AI assistant should:
1. **Answer Questions**: Cooking, recipe, and ingredient-related queries
2. **Context Awareness**: Understand overall app context
3. **Recommend Recipes**: Based on user's existing ingredients in database
4. **Save AI Recipes**: Ability to save AI-generated recipes directly to recipe library

### Use Cases
- "What can I cook with chicken and broccoli?"
- "How do I prepare a medium-difficulty dinner?"
- "What recipes use ingredients expiring soon?"
- Generate and save custom recipes

---

## 7. Navigation Structure

### Bottom Navigation Bar (5 Main Pages)
1. **Home**: Introduction + Recommended Menu
2. **Menu Calendar**: Calendar view + planned meals
3. **Ingredients**: Ingredient inventory management
4. **Recipe**: Recipe library and management
5. **Bot**: AI assistant for cooking help

---

## 8. Database Requirements

### Delicacies/Recipes Database
**Attributes**:
- Recipe ID
- Name
- Meal Type (Breakfast/Lunch/Dinner)
- Difficulty (Easy/Medium/Difficult)
- Preparation Time
- Ingredients List (with quantities)
- Cooking Steps
- Creation Date

### Menu Calendar Database
**Attributes**:
- Date
- Recipe ID (foreign key)
- Meal Type

### Ingredients Database
**Attributes**:
- Ingredient ID
- Name
- Category (Vegetable/Fruit/Meat/Seafood/etc.)
- Quantity
- Unit (pcs/kg/box/etc.)
- Added Date
- Shelf Life (days)
- Expiration Date (calculated)
- Source (My Ingredients/Recipe Ingredients)

---

## 9. Visual Design Guidelines

### Color Coding
- **Breakfast**: Distinct color (e.g., yellow/orange)
- **Lunch**: Distinct color (e.g., green)
- **Dinner**: Distinct color (e.g., blue)

### Card Design
- Consistent small card visual style across the app
- Clear hierarchy: prominent elements vs. subdued details
- Rounded corners for modern look
- Sufficient padding and spacing

### Typography
- **Primary**: Item names, headers (bold, larger)
- **Secondary**: Descriptions, metadata (lighter weight, smaller, subdued color)

### Interactive Elements
- Checkboxes for multi-selection
- Clear button states (enabled/disabled)
- Visual feedback on tap/click

---

## 10. Technical Considerations

### Platform
- React Native with Expo
- Android deployment target

### Key Features
- Random recipe selection algorithm
- Calendar integration
- Expiration date calculations
- Search functionality
- Filtering and sorting
- AI integration (future consideration)

### Data Flow
1. User opens app → Introduction screen
2. "Generate Random Menu" → Fetch random recipes from database
3. Select items → Add to Menu Calendar with date
4. View Menu Calendar → See planned meals by date
5. Click meal → View detailed recipe
6. Manage ingredients → Track inventory and expiration
7. Browse recipes → Discover and add new dishes
8. AI Bot → Get recommendations and generate recipes

---

## 11. Future Enhancements
- AI-powered recipe generation
- Ingredient-based recipe recommendations
- Shopping list generation from menu calendar
- Nutrition information
- Cooking timers and notifications
- Recipe sharing
- Photo uploads for dishes
- Meal prep planning

---

## Project Status
Created: 2026-01-25
Last Updated: 2026-01-25
Version: 1.0
