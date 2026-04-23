-- Fix Row Level Security (RLS) for WhatToEat App
-- This app uses anonymous access (no user authentication),
-- so all tables need permissive policies for anon role.
--
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New Query

-- ============================================
-- Option A: Disable RLS entirely (simpler)
-- ============================================
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_calendar DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Option B: Keep RLS enabled but allow all operations
-- (Uncomment below and comment out Option A if you prefer)
-- ============================================
-- -- Recipes
-- ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all on recipes" ON recipes FOR ALL USING (true) WITH CHECK (true);
--
-- -- Recipe Ingredients
-- ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all on recipe_ingredients" ON recipe_ingredients FOR ALL USING (true) WITH CHECK (true);
--
-- -- Ingredients
-- ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all on ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);
--
-- -- Menu Calendar
-- ALTER TABLE menu_calendar ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all on menu_calendar" ON menu_calendar FOR ALL USING (true) WITH CHECK (true);
