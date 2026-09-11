# Install Karibu on your phone

## Option A — Install from the website (PWA) — available now

1. Open https://karibu-kenya-0k91.netlify.app on your phone
2. **Android Chrome:** tap **Install app** on the home screen, or menu ⋮ → Install app / Add to Home screen
3. **iPhone Safari:** Share → Add to Home Screen
4. Karibu opens full-screen like a normal app

## Option B — Real Android APK file

On a computer with Node.js + Android Studio:

```bash
git clone https://github.com/gachiesamuel14/karibu-kenya.git
cd karibu-kenya
npm install
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio: Build → Build APK(s). Copy the APK to your phone and install it.

Play Store needs a developer account, privacy policy, and 18+ rating for dating apps.

## Note

This MVP still stores data on the device. Add Supabase before a public multi-user launch.
