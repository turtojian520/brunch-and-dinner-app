# Deploying the web app to Vercel

The Android and iOS shells are useless until the web app is live somewhere.
Follow these steps the **first time**; afterwards you only need step 2 to push
updates.

## Prerequisites (one time)

- A free [Vercel](https://vercel.com) account (sign in with GitHub).
- Node.js 18+ installed locally.
- This repo pushed to GitHub (already done).

---

## Option A — Deploy from the Vercel dashboard (recommended, no CLI needed)

1. Visit <https://vercel.com/new> and click **Import Git Repository**.
2. Select `turtojian520/brunch-and-dinner-app`.
3. On the **Configure Project** screen, set:
   - **Root Directory**: `web`
   - **Framework Preset**: **Other**
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Open **Environment Variables** and add (see
   [`web/docs/PROXY_SETUP.md`](./web/docs/PROXY_SETUP.md) for full context):
   - `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key
   - `GEMINI_API_KEY` — server-only; powers the `/api/gemini` proxy so the
     key never lands in the JS bundle. **Do not** prefix with `EXPO_PUBLIC_`.
5. Click **Deploy**. After ~2 minutes you'll get a URL like
   `https://brunch-and-dinner-app.vercel.app` (or `https://whatoeat.vercel.app`
   if you claimed that name).
6. Copy that URL — you'll need it in the next section.

---

## Option B — Deploy via the Vercel CLI

```bash
npm install -g vercel

cd web
vercel login                     # one-time: authenticate
vercel link                      # link this directory to a Vercel project
vercel --prod                    # build and deploy
```

When asked, answer:

- *Set up and deploy?* → **yes**
- *Link to existing project?* → **no** (first time) / **yes** (after that)
- *Project name* → e.g. `whatoeat`
- *Build command* → `npx expo export --platform web`
- *Output directory* → `dist`
- *Override settings* → **no** for the rest

The final line of output is your production URL.

---

## After deployment: wire the URL into the native shells

You only need to do this once (or whenever the deployment URL changes).

### Android

Open [`android/gradle.properties`](./android/gradle.properties) and edit:

```properties
WEB_APP_URL=https://your-actual-deployment.vercel.app
```

Rebuild: `cd android && ./gradlew assembleRelease`.

### iOS

Open [`ios/WhatToEat.xcodeproj`](./ios/WhatToEat.xcodeproj) in Xcode →
**WhatToEat** target → **Build Settings** → search for `WEB_APP_URL` and edit
the value (it appears under **User-Defined**). The setting is already wired into
`Info.plist` via `INFOPLIST_KEY_WEB_APP_URL`.

You can also edit it directly in `ios/WhatToEat.xcodeproj/project.pbxproj`
(search for `WEB_APP_URL = "https://`).

Rebuild from Xcode (Cmd-R) or via:

```bash
xcodebuild -project ios/WhatToEat.xcodeproj -scheme WhatToEat -configuration Release \
  WEB_APP_URL=https://your-actual-deployment.vercel.app
```

---

## Updating the app

Once everything is wired up:

- **UI change?** Push to `main` (or whichever branch is connected to Vercel).
  Vercel auto-deploys. Users see the change on next app launch — no APK/IPA
  rebuild needed.
- **Native shell change?** (rare — e.g., new permissions, new launch URL.)
  Rebuild the APK / IPA and ship a new store version.

---

## Sanity-check the deployment

Before publishing the apps, open the URL in a desktop browser. The full app
should render. If it does, the WebView shells will too.
