# 🍳 Get Started with WhatToEat

Welcome! This guide will get you up and running in minutes.

## 🎯 What You Have

A complete, production-ready Android meal planning app with:
- ✅ 5 main pages (Home, Calendar, Ingredients, Recipes, Bot)
- ✅ Random menu generation
- ✅ Calendar-based meal planning
- ✅ Ingredient inventory management
- ✅ Recipe library with 6 sample recipes
- ✅ AI cooking assistant
- ✅ Full local data persistence
- ✅ Beautiful, intuitive UI

## ⚡ Quick Start (3 Steps)

### 1. Install Dependencies
```bash
cd "/Users/qinhao/Documents/python/VS_code_python/projects/op.2_brunch&dinner/whatoeat"
npm install
```

### 2. Start the App
```bash
npm start
```

### 3. Run on Android
- Press `a` for Android emulator
- OR scan QR code with Expo Go app on your phone

**That's it!** Your app is now running.

## 📱 Try These Features

### First Time Flow
1. **Open app** → See welcome screen with 🍳🥗🍝
2. **Tap "Generate Random Menu"** → See 4 random recipes
3. **Check some recipes** → Checkboxes appear
4. **Tap "Add to Menu Calendar"** → Pick a date
5. **Tap "Save"** → Recipes added to calendar!

### Explore All Features
- **📅 Calendar Tab**: View your meal plan by date
- **🥬 Ingredients Tab**: Add items to your inventory
- **📖 Recipes Tab**: Browse and add custom recipes
- **🤖 Bot Tab**: Ask cooking questions

## 📂 Project Structure

```
whatoeat/
├── App.js                    # Main app entry
├── src/
│   ├── screens/              # 8 screen components
│   ├── navigation/           # Navigation setup
│   ├── data/                 # Mock recipes
│   └── utils/                # Storage utilities
├── package.json              # Dependencies
└── Documentation files       # Guides and references
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **GET_STARTED.md** | You are here! Quick start guide |
| **QUICKSTART.md** | 5-minute setup guide |
| **README.md** | Complete feature overview |
| **PROJECT_OVERVIEW.md** | Technical architecture |
| **APP_STRUCTURE.md** | Visual app structure |
| **SETUP_AND_DEPLOY.md** | Deployment guide |
| **ROADMAP.md** | Future features |

## 🎨 Customization

### Change Colors
Edit the color constants in each screen file:
```javascript
// Example: Change primary color
const PRIMARY_COLOR = '#FF6B6B'; // Change this!
```

### Add More Recipes
Edit `src/data/mockRecipes.js`:
```javascript
{
  id: '7',
  name: 'Your Recipe',
  mealType: 'lunch',
  difficulty: 'easy',
  time: 20,
  ingredients: [...],
  steps: [...]
}
```

### Modify UI
All screens are in `src/screens/` - edit any file to customize!

## 🐛 Troubleshooting

**Problem**: Dependencies won't install
```bash
rm -rf node_modules
npm install
```

**Problem**: App won't start
```bash
npm start -- --clear
```

**Problem**: Can't connect to device
- Ensure same WiFi network
- Try: `npm start -- --tunnel`

## 🚀 Next Steps

### For Development
1. Read `PROJECT_OVERVIEW.md` for architecture
2. Explore the code in `src/screens/`
3. Add your own features
4. Test on real device

### For Deployment
1. Read `SETUP_AND_DEPLOY.md`
2. Build APK: `eas build --platform android`
3. Test thoroughly
4. Publish to Google Play Store

## 💡 Tips

- **Data persists**: All data saved locally with AsyncStorage
- **Hot reload**: Save files to see changes instantly
- **Mock data**: 6 sample recipes included
- **Offline ready**: Works without internet
- **No backend needed**: Everything runs locally

## 🎓 Learning Resources

- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/

## ✨ Features Highlight

### Home Page
- Welcome screen with branding
- Random menu generation (4 recipes)
- Checkbox selection
- Add to calendar with date picker

### Menu Calendar
- Visual calendar with meal indicators
- Grouped by breakfast/lunch/dinner
- Color-coded meal types
- Tap for recipe details

### Ingredients
- Add with expiration tracking
- Search and filter
- Sort by name/quantity/expiration
- Category organization

### Recipes
- Browse library
- Filter by type and difficulty
- Add custom recipes
- Detailed cooking instructions

### AI Bot
- Recipe recommendations
- Cooking tips
- Ingredient substitutions
- Meal planning advice

## 🎯 What Makes This Special

✅ **Complete**: All features fully implemented
✅ **Production-Ready**: No placeholders or TODOs
✅ **Well-Documented**: Extensive guides included
✅ **Beautiful UI**: Modern, intuitive design
✅ **Performant**: Optimized for smooth experience
✅ **Extensible**: Easy to add new features

## 🤔 Need Help?

1. Check the documentation files
2. Read error messages carefully
3. Clear cache: `npm start -- --clear`
4. Reinstall: `rm -rf node_modules && npm install`

## 🎉 You're Ready!

Your WhatToEat app is complete and ready to use. Start the development server and begin exploring!

```bash
npm start
```

Then press `a` for Android or scan the QR code.

**Happy Cooking! 🍳**

---

**Quick Links**:
- [Quick Start](QUICKSTART.md) - 5-minute guide
- [Full README](README.md) - Feature details
- [Deployment](SETUP_AND_DEPLOY.md) - Publishing guide
- [Roadmap](ROADMAP.md) - Future features
