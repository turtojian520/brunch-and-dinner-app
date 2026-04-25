# Supabase Backend Setup

This directory contains the database schema and configuration for the WhatToEat app backend.

## Database Schema

The database consists of 4 main tables:

### 1. **recipes**
Stores all recipe information including name, meal type, difficulty, cooking time, and steps.

### 2. **recipe_ingredients**
Join table linking recipes to their required ingredients with quantities and units.

### 3. **ingredients**
User's ingredient inventory with quantity tracking and expiration date management.

### 4. **menu_calendar**
Planned meals calendar linking dates to specific recipes.

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `whatoeat` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your location
5. Click "Create new project"

### Step 2: Run the Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy the contents of `schema.sql` and paste into the editor
4. Click "Run" to execute the schema
5. Verify tables were created by checking the **Table Editor**

### Step 3: Get Your API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 4: Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials:
   ```
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Database Features

### Auto-calculated Fields

- **expiration_date**: Automatically calculated from `added_date + shelf_life_days`
- **updated_at**: Automatically updated on record modification

### Indexes

Optimized indexes for:
- Filtering by meal type and difficulty
- Sorting by expiration date
- Search by ingredient name

### Data Integrity

- Foreign key constraints ensure referential integrity
- Check constraints validate enum values (meal_type, difficulty, source)
- Unique constraints prevent duplicate calendar entries

## API Usage Examples

### Fetch All Recipes

```javascript
const { data, error } = await supabase
  .from('recipes')
  .select(`
    *,
    recipe_ingredients (*)
  `);
```

### Add Recipe to Menu Calendar

```javascript
const { data, error } = await supabase
  .from('menu_calendar')
  .insert({
    date: '2026-01-25',
    recipe_id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    meal_type: 'breakfast'
  });
```

### Get Ingredients Expiring Soon

```javascript
const { data, error } = await supabase
  .from('ingredients')
  .select('*')
  .lte('expiration_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
  .order('expiration_date', { ascending: true });
```

## Security Notes

- Row Level Security (RLS) is commented out in the schema
- Uncomment RLS policies if you add user authentication
- The current setup allows public read/write access
- For production, implement proper authentication and RLS

## Migration

If you need to update the schema later:

1. Create a new SQL migration file
2. Run it in the SQL Editor
3. Test thoroughly before deploying to production

## Backup

Supabase automatically backs up your database. You can also:
- Export data via the Table Editor
- Use `pg_dump` for manual backups
- Set up point-in-time recovery in project settings
