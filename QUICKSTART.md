# Quick Start Guide

## Get the App Running in 5 Minutes

### 1. Install Dependencies
```bash
cd "op.2_brunch&dinner/whatoeat"
npm install
```

### 2. Start the App
```bash
npm start
```

### 3. Run on Android

**Option A: Android Emulator**
- Make sure Android Studio is installed with an emulator
- Press `a` in the terminal

**Option B: Physical Device**
- Install "Expo Go" from Google Play Store
- Scan the QR code shown in the terminal

## First Time Using the App?

### Try These Steps:

1. **Home Page Flow**:
   - Open app → See intro screen
   - Tap "Generate Random Menu"
   - Check some recipes
   - Tap "Add to Menu Calendar"
   - Pick a date and save

2. **Add Some Ingredients**:
   - Go to Ingredients tab
   - Tap + button
   - Add items like: Apple, Chicken, Rice, Tomato
   - Set quantities and expiration dates

3. **Browse Recipes**:
   - Go to Recipes tab
   - Filter by meal type or difficulty
   - Tap any recipe to see details
   - Add your own custom recipe with +

4. **Ask the AI Assistant**:
   - Go to Bot tab
   - Ask: "What can I make with my ingredients?"
   - Get personalized recipe recommendations

5. **Check Your Calendar**:
   - Go to Calendar tab
   - Browse different dates
   - See your planned meals
   - Tap any meal to see cooking instructions

## Troubleshooting

**App won't start?**
- Make sure Node.js is installed: `node --version`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Can't connect to device?**
- Make sure phone and computer are on same WiFi
- Try restarting the Expo server

**Build errors?**
- Clear Expo cache: `expo start -c`

## Need Help?

Check the main README.md for detailed documentation and features.
