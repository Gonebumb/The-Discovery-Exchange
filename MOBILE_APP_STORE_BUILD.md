# Building Native iOS (App Store) & Android (Google Play) Apps — TDEX

This repository includes two complete mobile app paths:

1. **Instant Mobile Web App (PWA — Live Immediately, $0 App Store Delay):**
   - Configured in `index.html`, `public/manifest.webmanifest`, `public/sw.js`, `public/icon.svg`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512x512.png`, `public/apple-touch-icon.png`, and `src/components/PWAInstallButton.tsx`.
   - Visitors on **iPhone (Safari → Share → Add to Home Screen)** and **Android (Chrome → Install TDEX App)** install **TDEX** directly onto their phone home screens with offline caching and full-screen standalone mode on both `thediscoveryexchange.com` and `nationaldiscoveryawards.com`.

2. **Native Apple App Store (`.ipa`) & Google Play Store (`.aab` / `.apk`) via Capacitor:**
   Once your site is live at `https://thediscoveryexchange.com` (and mapped to `https://nationaldiscoveryawards.com`), run these commands on a Mac (for Xcode/iOS) or Windows/Mac/Linux (for Android Studio):

   ```bash
   # 1. Install dependencies
   npm install
   npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

   # 2. Build the production web bundle into dist/
   npm run build

   # 3. Generate native iOS & Android projects using capacitor.config.json
   npx cap add ios
   npx cap add android
   npx cap sync

   # 4. Open native IDE to sign and publish to App Store / Google Play
   npx cap open ios      # Opens Xcode (requires Mac + Apple Developer account)
   npx cap open android  # Opens Android Studio (requires Google Play Console account)
   ```

> **Backend API Note:** `capacitor.config.json` points directly to `https://thediscoveryexchange.com` so all Owner accounts (`1 Human = 1 Vote`), Marketplace 50/25/25 trades, Wallets, and Concierge Q1–Q112 stay live and synchronized across Web, PWA, iOS, and Android. You can map both `thediscoveryexchange.com` and `nationaldiscoveryawards.com` to the same Cloud Run service in Domain Mappings.
