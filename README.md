# WhatToEat — WebView shell architecture

This repository now contains **three independent subprojects**:

| Path       | What it is                                 | Language / framework        |
|------------|--------------------------------------------|-----------------------------|
| `web/`     | The actual app UI, deployed to the web     | React Native + Expo (RN-Web)|
| `android/` | Thin native Android shell wrapping a WebView | Kotlin (AppCompat + WebKit) |
| `ios/`     | Thin native iOS shell wrapping a WKWebView | Swift (SwiftUI + WebKit)    |

The web build is the **single source of truth for UI and behavior**. Both native
shells just point a WebView at the deployed web URL, so:

- **Cross-platform consistency** is automatic — Android and iOS render the
  exact same HTML/CSS/JS.
- The previous bug where buttons rendered invisibly on Android (a React-Native
  Android quirk) cannot recur, because no React Native code ships inside the
  Android or iOS apps any more.
- Updating the app for most users no longer requires shipping a new APK / IPA;
  redeploying the web build is enough.

```
   ┌────────────────────────┐         ┌────────────────────────┐
   │  android/  (Kotlin)    │         │   ios/  (Swift)        │
   │  ↳ WebView ───────────►├─────────┤◄─────────── WKWebView  │
   └────────────────────────┘         └────────────────────────┘
                ▲                                ▲
                │ both load the same             │
                │ https://<your-app>.vercel.app  │
                ▼                                ▼
                ┌─────────────────────────────────────────┐
                │  web/   (React Native + Expo, RN-Web)   │
                │  Deployed to Vercel                     │
                └─────────────────────────────────────────┘
```

---

## Quick start

### 1. The web app (`web/`)

```bash
cd web
npm install
npm run web        # local dev server
```

Deploy it to Vercel — see [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md). After
deployment you'll have a URL such as `https://whatoeat.vercel.app`. Plug that
URL into the two native shells (one line each).

### 2. The Android shell (`android/`)

Open `android/` in Android Studio (or build from the command line):

```bash
cd android
./gradlew assembleDebug
# or, with a custom URL:
./gradlew assembleDebug -PWEB_APP_URL=https://your-deployment.vercel.app
```

The URL is configurable in **one place** — `android/gradle.properties`:

```properties
WEB_APP_URL=https://whatoeat.vercel.app
```

### 3. The iOS shell (`ios/`)

Open `ios/WhatToEat.xcodeproj` in Xcode and run on a simulator or device.

The URL is configurable in **one place** — the `WEB_APP_URL` user-defined build
setting in the Xcode target (already exposed via Info.plist key `WEB_APP_URL`).
You can edit it via Xcode → Target → Build Settings → search for `WEB_APP_URL`.
Default: `https://whatoeat.vercel.app`.

---

## Why this architecture

The previous setup compiled the React Native code into native Android/iOS
binaries via Expo. That gave good performance but coupled UI consistency to
React Native's platform-specific renderers, where bugs (like the invisible
buttons on Android) were hard to track down.

The WebView-shell approach trades a small amount of runtime cost (a WebView
instead of native views) for:

1. **One renderer per device.** Whatever WebKit/Blink renders, you ship.
2. **Hot updates.** Push to Vercel → users see the new version on next launch.
3. **Tiny native codebases** that are easy to audit and rebuild — the entire
   Android shell is one Activity, the iOS shell is four Swift files.
4. **A clean migration path** away from React Native Web later (e.g. Next.js +
   plain React) without touching the shells.

---

## Layout details

```
.
├── README.md              ← you are here
├── DEPLOY_VERCEL.md       ← step-by-step deployment guide (manual)
├── android/               ← Kotlin shell (no React Native)
│   ├── app/src/main/java/com/whatoeat/app/MainActivity.kt
│   ├── app/build.gradle
│   └── ...
├── ios/                   ← Swift shell (no React Native)
│   ├── WhatToEat/WhatToEatApp.swift
│   ├── WhatToEat/WebViewContainer.swift
│   └── WhatToEat.xcodeproj/
└── web/                   ← The Expo / RN-Web app (this is what gets deployed)
    ├── App.js
    ├── src/
    ├── api/               ← Vercel serverless functions (Gemini proxy)
    ├── vercel.json
    ├── package.json
    └── docs/              ← design docs + PROXY_SETUP.md
```

## Secrets handling

The Gemini API key is **never** shipped to the client. The web app posts to
`/api/gemini`, a Vercel serverless function in `web/api/gemini.js` that
reads `GEMINI_API_KEY` server-side and forwards the request to Google. The
Android and iOS WebView shells inherit this for free because they load the
deployed Vercel origin — the relative `/api/gemini` URL just works.

See [`web/docs/PROXY_SETUP.md`](./web/docs/PROXY_SETUP.md) for the full
breakdown and the env vars to add in the Vercel dashboard.
