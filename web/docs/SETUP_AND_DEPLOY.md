# Complete Setup and Deployment Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Expo CLI** (will be installed with dependencies)
   - No separate installation needed

### For Android Development

**Option A: Physical Android Device**
- Android phone or tablet
- USB cable (for initial setup)
- Expo Go app from Google Play Store

**Option B: Android Emulator**
- Android Studio installed
- Android SDK configured
- At least one Android Virtual Device (AVD) created

## 🚀 Quick Setup (5 Minutes)

### Step 1: Navigate to Project
```bash
cd "/Users/qinhao/Documents/python/VS_code_python/projects/op.2_brunch&dinner/whatoeat"
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- React Native and Expo
- Navigation libraries
- AsyncStorage for data persistence
- Calendar component
- All other dependencies

### Step 3: Start Development Server
```bash
npm start
```

Or use the setup script:
```bash
./setup.sh
```

### Step 4: Run on Android

**For Physical Device:**
1. Install "Expo Go" from Google Play Store
2. Make sure your phone and computer are on the same WiFi network
3. Open Expo Go app
4. Scan the QR code shown in the terminal

**For Emulator:**
1. Start your Android emulator from Android Studio
2. In the terminal where Expo is running, press `a`
3. The app will automatically install and launch

## 📱 Testing the App

### First Launch Checklist
1. ✅ App opens to intro screen
2. ✅ "Generate Random Menu" button works
3. ✅ Can see 4 random recipes
4. ✅ Can check/uncheck recipes
5. ✅ Can add recipes to calendar
6. ✅ Bottom navigation works (5 tabs)

### Test Each Feature
1. **Home Flow**
   - Generate menu → Select recipes → Add to calendar → Pick date → Save

2. **Calendar**
   - View calendar → Select date → See meals → Tap meal for details

3. **Ingredients**
   - Add ingredient → Fill details → Save → See in list → Filter/sort

4. **Recipes**
   - Browse recipes → Filter by type/difficulty → Add custom recipe → View details

5. **Bot**
   - Ask question → Get response → Ask about ingredients → Get recommendations

## 🔧 Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
```bash
rm -rf node_modules
npm install
```

**2. Expo won't start**
```bash
npm install -g expo-cli
expo start --clear
```

**3. Can't connect to device**
- Ensure both devices are on same WiFi
- Disable VPN if active
- Try using tunnel mode: `expo start --tunnel`

**4. Android emulator not detected**
```bash
# Check if emulator is running
adb devices

# If not listed, restart emulator
```

**5. Build errors**
```bash
# Clear cache and restart
expo start -c
```

**6. AsyncStorage warnings**
- These are normal and don't affect functionality
- Data is being saved correctly

## 📦 Building for Production

### Build APK for Android

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure Build**
```bash
eas build:configure
```

4. **Build APK**
```bash
eas build --platform android --profile preview
```

5. **Download APK**
- Build will be available in your Expo dashboard
- Download and install on Android device

### Alternative: Expo Build Service

```bash
expo build:android
```

Follow the prompts to:
- Choose APK or App Bundle
- Let Expo manage keystore (for first build)
- Wait for build to complete
- Download APK from provided URL

## 🌐 Publishing to Google Play Store

### Prerequisites
1. Google Play Developer account ($25 one-time fee)
2. App signing key
3. Privacy policy URL
4. App screenshots and description

### Steps

1. **Build App Bundle**
```bash
eas build --platform android --profile production
```

2. **Prepare Store Listing**
- App name: WhatToEat
- Short description: Your daily meal planning companion
- Full description: (see README.md)
- Category: Food & Drink
- Screenshots: Take from emulator/device

3. **Upload to Play Console**
- Go to Google Play Console
- Create new app
- Upload App Bundle (.aab file)
- Fill in store listing details
- Set pricing (Free)
- Submit for review

4. **Wait for Review**
- Usually takes 1-3 days
- Address any issues if rejected
- App goes live after approval

## 🔄 Updating the App

### For Development
```bash
# Just save your files, Expo will auto-reload
```

### For Production
```bash
# Increment version in app.json
# Then rebuild
eas build --platform android --profile production
```

### Over-The-Air (OTA) Updates
```bash
# For minor updates without rebuilding
eas update --branch production
```

## 📊 Monitoring and Analytics

### Add Analytics (Optional)

1. **Install Firebase**
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

2. **Configure in app.json**
```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app"
    ]
  }
}
```

3. **Track Events**
```javascript
import analytics from '@react-native-firebase/analytics';

analytics().logEvent('recipe_viewed', {
  recipe_name: 'Spaghetti Carbonara'
});
```

## 🐛 Debugging

### Enable Debug Mode
```bash
# Start with debug logging
EXPO_DEBUG=true npm start
```

### View Logs
```bash
# Android logs
adb logcat

# Expo logs (in terminal)
# Automatically shown when running npm start
```

### React Native Debugger
1. Install React Native Debugger
2. Shake device or press Cmd+D (emulator)
3. Select "Debug JS Remotely"

## 📝 Environment Variables

Create `.env` file for API keys (if needed):
```
API_KEY=your_api_key_here
BACKEND_URL=https://api.example.com
```

Install dotenv:
```bash
npm install react-native-dotenv
```

## 🔐 Security Best Practices

1. **Never commit sensitive data**
   - Add `.env` to `.gitignore`
   - Use environment variables for API keys

2. **Validate user input**
   - Already implemented in forms

3. **Secure storage**
   - AsyncStorage is encrypted on device
   - Consider expo-secure-store for sensitive data

## 📈 Performance Optimization

### Already Implemented
- FlatList for efficient scrolling
- useEffect for data loading
- Conditional rendering
- Optimized images

### Future Improvements
- Image caching
- Lazy loading
- Code splitting
- Memoization for expensive calculations

## 🎯 Next Steps

After successful setup:

1. **Customize the app**
   - Add your own recipes
   - Modify colors in styles
   - Add more features

2. **Test thoroughly**
   - Try all features
   - Test on different devices
   - Check edge cases

3. **Get feedback**
   - Share with friends
   - Collect user feedback
   - Iterate on design

4. **Deploy**
   - Build production APK
   - Test on real devices
   - Publish to Play Store

## 📞 Support

### Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Forums](https://forums.expo.dev/)

### Common Commands Reference
```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios

# Build for production
eas build --platform android

# Publish update
eas update

# Check for issues
expo doctor
```

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All features tested and working
- [ ] No console errors or warnings
- [ ] App icon and splash screen added
- [ ] Version number updated in app.json
- [ ] Privacy policy created (if collecting data)
- [ ] Terms of service written
- [ ] Screenshots taken for store listing
- [ ] App description written
- [ ] Keywords for SEO chosen
- [ ] Pricing decided (Free/Paid)
- [ ] In-app purchases configured (if any)
- [ ] Analytics set up
- [ ] Crash reporting enabled
- [ ] Beta testing completed
- [ ] Legal requirements met
- [ ] Google Play Developer account ready
- [ ] App signing key secured

## 🎉 Success!

Your WhatToEat app is now ready to help users plan their meals and discover delicious recipes!

For questions or issues, refer to the documentation files:
- `README.md` - Feature overview
- `QUICKSTART.md` - Quick start guide
- `PROJECT_OVERVIEW.md` - Technical details
- `APP_STRUCTURE.md` - Architecture guide
