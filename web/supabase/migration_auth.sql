-- WhatToEat Auth Migration
-- Adds user_id columns and RLS policies for multi-tenant user isolation.
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- ============================================
-- Step 1: Add user_id columns
-- ============================================
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE menu_calendar ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- ============================================
-- Step 2: Enable RLS
-- ============================================
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_calendar ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 3: Drop any existing permissive policies
-- ============================================
DROP POLICY IF EXISTS "Allow all on recipes" ON recipes;
DROP POLICY IF EXISTS "Allow all on recipe_ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Allow all on ingredients" ON ingredients;
DROP POLICY IF EXISTS "Allow all on menu_calendar" ON menu_calendar;

-- ============================================
-- Step 4: Create RLS policies (owner-only access)
-- ============================================

-- recipes
CREATE POLICY "Users can insert their own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own recipes" ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- recipe_ingredients
CREATE POLICY "Users can insert their own recipe_ingredients" ON recipe_ingredients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own recipe_ingredients" ON recipe_ingredients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipe_ingredients" ON recipe_ingredients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipe_ingredients" ON recipe_ingredients FOR DELETE USING (auth.uid() = user_id);

-- ingredients
CREATE POLICY "Users can insert their own ingredients" ON ingredients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own ingredients" ON ingredients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own ingredients" ON ingredients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ingredients" ON ingredients FOR DELETE USING (auth.uid() = user_id);

-- menu_calendar
CREATE POLICY "Users can insert their own menu entries" ON menu_calendar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own menu entries" ON menu_calendar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own menu entries" ON menu_calendar FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own menu entries" ON menu_calendar FOR DELETE USING (auth.uid() = user_id);
