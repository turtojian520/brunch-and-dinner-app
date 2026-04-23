-- WhatToEat App - Supabase Database Schema
-- Created: 2026-01-25

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- RECIPES TABLE
-- ============================================
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'difficult')),
  time INTEGER NOT NULL, -- cooking time in minutes
  steps TEXT[] NOT NULL, -- array of cooking steps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for filtering
CREATE INDEX idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);

-- ============================================
-- RECIPE INGREDIENTS TABLE (Join Table)
-- ============================================
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  property VARCHAR(100), -- e.g., 'meat', 'vegetable', 'dairy'
  quantity VARCHAR(50) NOT NULL, -- e.g., '2', '300'
  unit VARCHAR(50) NOT NULL, -- e.g., 'pcs', 'g', 'tbsp'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

-- ============================================
-- INGREDIENTS TABLE (User's Inventory)
-- ============================================
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- e.g., 'vegetable', 'fruit', 'meat', 'seafood'
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- e.g., 'pcs', 'kg', 'box'
  added_date DATE DEFAULT CURRENT_DATE,
  shelf_life_days INTEGER NOT NULL, -- duration in days
  expiration_date DATE NOT NULL, -- calculated: added_date + shelf_life_days
  source VARCHAR(50) DEFAULT 'my_ingredients' CHECK (source IN ('my_ingredients', 'recipe_ingredients')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for filtering and sorting
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_expiration_date ON ingredients(expiration_date);
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_source ON ingredients(source);

-- ============================================
-- MENU CALENDAR TABLE
-- ============================================
CREATE TABLE menu_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX idx_menu_calendar_unique ON menu_calendar(date, recipe_id, meal_type);
CREATE INDEX idx_menu_calendar_date ON menu_calendar(date DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for recipes table
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ingredients table
CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate expiration date before insert
CREATE OR REPLACE FUNCTION calculate_expiration_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expiration_date = NEW.added_date + (NEW.shelf_life_days || ' days')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate expiration date
CREATE TRIGGER set_expiration_date
  BEFORE INSERT OR UPDATE OF added_date, shelf_life_days ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION calculate_expiration_date();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- ============================================
-- Uncomment if you want to enable user authentication

-- ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_calendar ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Enable read access for all users" ON recipes FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON recipes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Enable update for authenticated users only" ON recipes FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Enable delete for authenticated users only" ON recipes FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA (Optional - Insert mock recipes)
-- ============================================

-- Insert sample recipes
INSERT INTO recipes (id, name, meal_type, difficulty, time, steps) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Scrambled Eggs with Toast', 'breakfast', 'easy', 10,
   ARRAY['Crack eggs into a bowl and whisk with salt', 'Heat butter in a pan over medium heat', 'Pour eggs into the pan and stir gently', 'Toast bread slices until golden', 'Serve scrambled eggs on toast']),

  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Chicken Stir Fry', 'lunch', 'medium', 25,
   ARRAY['Cut chicken into bite-sized pieces', 'Slice bell peppers and mince garlic', 'Heat oil in a wok over high heat', 'Stir fry chicken until cooked through', 'Add vegetables and garlic, stir fry for 3 minutes', 'Add soy sauce and toss to combine', 'Serve hot with rice']),

  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Spaghetti Carbonara', 'dinner', 'medium', 30,
   ARRAY['Cook spaghetti according to package instructions', 'Dice bacon and fry until crispy', 'Beat eggs with grated parmesan and black pepper', 'Drain pasta, reserving 1 cup of pasta water', 'Mix hot pasta with bacon', 'Remove from heat and quickly stir in egg mixture', 'Add pasta water if needed to create creamy sauce', 'Serve immediately with extra parmesan']),

  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Avocado Toast', 'breakfast', 'easy', 8,
   ARRAY['Toast bread slices until golden', 'Mash avocado with lemon juice and salt', 'Spread avocado mixture on toast', 'Sprinkle with red pepper flakes', 'Serve immediately']),

  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Beef Tacos', 'dinner', 'easy', 20,
   ARRAY['Brown ground beef in a pan', 'Add taco seasoning and water, simmer for 5 minutes', 'Warm taco shells in oven', 'Chop lettuce and dice tomatoes', 'Shred cheese', 'Fill taco shells with beef', 'Top with lettuce, tomatoes, and cheese', 'Serve with salsa and sour cream']),

  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Greek Salad', 'lunch', 'easy', 15,
   ARRAY['Chop cucumber, tomatoes, and red onion', 'Combine vegetables in a large bowl', 'Add olives and crumbled feta cheese', 'Whisk together olive oil and lemon juice', 'Pour dressing over salad and toss', 'Season with salt and oregano', 'Serve chilled']);

-- Insert recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, name, property, quantity, unit) VALUES
  -- Scrambled Eggs with Toast
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Eggs', 'protein', '2', 'pcs'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Butter', 'dairy', '1', 'tbsp'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Bread', 'grain', '2', 'slices'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Salt', 'seasoning', '1', 'pinch'),

  -- Chicken Stir Fry
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Chicken Breast', 'meat', '300', 'g'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Bell Peppers', 'vegetable', '2', 'pcs'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Soy Sauce', 'seasoning', '2', 'tbsp'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Garlic', 'vegetable', '3', 'cloves'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Vegetable Oil', 'oil', '2', 'tbsp'),

  -- Spaghetti Carbonara
  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Spaghetti', 'pasta', '400', 'g'),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Bacon', 'meat', '200', 'g'),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Eggs', 'protein', '3', 'pcs'),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Parmesan Cheese', 'dairy', '100', 'g'),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Black Pepper', 'seasoning', '1', 'tsp'),

  -- Avocado Toast
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Avocado', 'fruit', '1', 'pcs'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Bread', 'grain', '2', 'slices'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Lemon Juice', 'citrus', '1', 'tsp'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Salt', 'seasoning', '1', 'pinch'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Red Pepper Flakes', 'seasoning', '0.5', 'tsp'),

  -- Beef Tacos
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Ground Beef', 'meat', '500', 'g'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Taco Shells', 'grain', '8', 'pcs'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Lettuce', 'vegetable', '1', 'head'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Tomatoes', 'vegetable', '2', 'pcs'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Cheese', 'dairy', '150', 'g'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Taco Seasoning', 'seasoning', '2', 'tbsp'),

  -- Greek Salad
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Cucumber', 'vegetable', '1', 'pcs'),
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Tomatoes', 'vegetable', '3', 'pcs'),
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Feta Cheese', 'dairy', '200', 'g'),
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Olives', 'fruit', '100', 'g'),
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Red Onion', 'vegetable', '0.5', 'pcs'),
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Olive Oil', 'oil', '3', 'tbsp'),
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Lemon Juice', 'citrus', '2', 'tbsp');
