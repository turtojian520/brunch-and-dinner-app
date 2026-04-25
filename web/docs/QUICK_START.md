# WhatToEat - Quick Start Guide

## 🚀 Get Your App Running in 10 Minutes

### Step 1: Set Up Supabase (5 minutes)

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create Project**
   - Click "New Project"
   - Organization: Create new or use existing
   - Name: `whatoeat`
   - Database Password: Create strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project" (wait 2-3 minutes)

3. **Run Database Schema**
   - In left sidebar, click "SQL Editor"
   - Click "New Query"
   - Open `supabase/schema.sql` from this project
   - Copy all contents
   - Paste into SQL Editor
   - Click "Run" (green button)
   - You should see "Success. No rows returned"

4. **Get API Credentials**
   - In left sidebar, click "Settings" (gear icon)
   - Click "API"
   - Copy these two values:
     - **Project URL** (looks like: https://abcdefgh.supabase.co)
     - **anon/public** key (under "Project API keys", very long string starting with eyJ...)

### Step 2: Configure App (2 minutes)

1. **Create Environment File**

In project root, create a file named `.env`:

```bash
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-LONG-KEY-HERE
```

**Replace** the values with your actual URL and key from Step 1.

**Important:**
- No spaces around the `=` sign
- No quotes around the values
- Make sure `.env` is in the same folder as `package.json`

2. **Verify `.gitignore`**

Check that `.env` is listed in `.gitignore` file (it should already be there).

### Step 3: Start App (3 minutes)

1. **Install Dependencies** (if not already done)

```bash
npm install
```

2. **Clear Cache and Start**

```bash
npx expo start --clear
```

3. **Run on Android**

Press `a` in terminal, or:

```bash
npm run android
```

### Step 4: Verify It Works! (1 minute)

1. **App Opens** - You should see the intro screen with food emojis

2. **Click "Generate Random Menu"** - Should see 4 random recipes

3. **Check Supabase Dashboard**
   - Go to Supabase dashboard
   - Click "Table Editor" in left sidebar
   - Click `recipes` table
   - You should see 6 recipes!

4. **Add a Recipe**
   - In app, go to "Recipes" tab
   - Click "+" button
   - Fill in recipe details
   - Click "Add Recipe"
   - Go back to Supabase dashboard
   - Refresh `recipes` table
   - Your new recipe is there!

## ✅ If Everything Works

You should be able to:
- ✅ See 6 sample recipes on home screen
- ✅ Add new recipes and see them in Supabase
- ✅ Add ingredients and see them in Supabase
- ✅ Add recipes to menu calendar
- ✅ Close and reopen app - data persists!

## 🐛 Troubleshooting

### Error: "Supabase not configured"

**Problem:** Environment variables not loaded

**Solution:**
1. Check `.env` file exists in project root
2. Check no typos in variable names
3. Restart Expo dev server: `Ctrl+C` then `npx expo start --clear`
4. Try: `npm install react-native-dotenv` then restart

### App shows "Using offline data"

**Problem:** Can't connect to Supabase

**Solution:**
1. Check SUPABASE_URL is correct (no typos)
2. Check SUPABASE_ANON_KEY is correct (entire key)
3. Check internet connection
4. Verify project is active in Supabase dashboard
5. Try restarting Expo dev server

### No recipes showing

**Problem:** Database not initialized

**Solution:**
1. Wait for loading spinner to finish (may take 5-10 seconds on first load)
2. Check Supabase Table Editor → recipes table has data
3. If recipes table is empty, check SQL Editor for errors when you ran schema.sql

### Can't run schema.sql

**Problem:** SQL syntax error

**Solution:**
1. Make sure you copied the ENTIRE file contents
2. Check there are no extra characters at start/end
3. Try copying in smaller chunks (one table at a time)

### Metro bundler errors

**Problem:** Cache issues

**Solution:**
```bash
# Stop Expo dev server (Ctrl+C)
npx expo start --clear
# or
rm -rf node_modules
npm install
npx expo start --clear
```

## 📱 Testing Checklist

Once running, test these features:

**Home Screen:**
- [x] See intro screen with "Generate Random Menu" button
- [x] Click button → redirects to recommended menu
- [x] See 4 random recipes
- [x] Can check recipes with checkbox
- [x] "Add to Menu Calendar" button enables when checked
- [x] "Generate New Menu" shows different recipes

**Recipes Tab:**
- [x] See list of recipes
- [x] Filter by meal type (breakfast/lunch/dinner)
- [x] Filter by difficulty (easy/medium/hard)
- [x] Click recipe → see details
- [x] Click "+" → add new recipe form
- [x] Add recipe → appears in list

**Ingredients Tab:**
- [x] See ingredient list
- [x] Search for ingredients
- [x] Filter by category
- [x] Sort by name/quantity/expiration
- [x] Click "+" → add ingredient form
- [x] Add ingredient → appears in list

**Calendar Tab:**
- [x] See calendar
- [x] Select date → see meals for that date
- [x] Dates with meals show red dot
- [x] Click meal → see recipe details

**Bot Tab:**
- [x] See chat interface
- [x] Type message → get response
- [x] Ask for recipe recommendations
- [x] Bot suggests recipes based on ingredients

## 🎊 Success!

If all tests pass, your WhatToEat app is fully operational with cloud backend!

**What to do next:**
- Add your favorite recipes
- Plan your meals for the week
- Add ingredients to your inventory
- Explore the bot assistant

## 📚 Learn More

- **Full Documentation:** Read `BACKEND_INTEGRATION.md`
- **API Reference:** See service methods in `BACKEND_INTEGRATION.md`
- **App Specification:** Check `CLAUDE.MD`

## 💡 Tips

1. **First Load is Slow** - Database initializes with mock recipes, takes 5-10 seconds
2. **Offline Mode** - App works offline with cached data
3. **Data Syncs** - Changes save to cloud automatically
4. **No Login Required** - Current version is public access (great for testing!)

## 🎓 Understanding the Architecture

```
Your App → Services → Supabase Client → Internet → Supabase Cloud → PostgreSQL Database
```

**When you add a recipe:**
1. You click "Add Recipe" in app
2. RecipeService.createRecipe() is called
3. Supabase client sends HTTP request
4. Supabase server saves to PostgreSQL
5. Response sent back to app
6. UI updates to show new recipe

**When you load recipes:**
1. App opens or you navigate to Recipes tab
2. RecipeService.getAllRecipes() is called
3. Supabase client fetches from database
4. Data transformed to frontend format
5. React state updates
6. UI renders recipe list

---

**Questions?** Check `BACKEND_INTEGRATION.md` for detailed troubleshooting!

**Ready to code?** All source files are in `src/` directory!

**Happy meal planning!** 🍳🥗🍝
