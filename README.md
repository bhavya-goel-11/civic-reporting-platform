# Civic Issues Reporting Platform

Monorepo with:
- `apps/web`: Next.js 15 website (React 19, Tailwind)
- `apps/mobile`: Expo/React Native app (file-based routing, Supabase integration)

## Prerequisites
- Node.js 18+ and npm
- For mobile: optional Android Studio (Android) and Xcode (iOS). You can also use Expo Go on a device.

## Install dependencies (once)
From the repo root:

```cmd
npm install
```

## Run the website (Next.js)
Pick one of the following:

- From the repo root using workspaces:
	```cmd
	npm run --workspace apps/web dev
	```
- Or from inside `apps/web`:
	```cmd
	cd apps\web
	npm run dev
	```

Then open `http://localhost:3000`.

## Run the mobile app (Expo)
Pick one of the following:

- From the repo root using workspace scripts:
	```cmd
	npm run mobile:start
	```
	Helpful variants:
	```cmd
	npm run mobile:android
	npm run mobile:ios
	npm run mobile:web
	```
- Or from inside `apps/mobile`:
	```cmd
	cd apps\mobile
	npm run start
	```

This starts the Expo Dev Tools/Metro bundler. Follow the on-screen prompts to open on Android (`a`), iOS (`i` on macOS), or scan the QR code with Expo Go.


See `apps/web/README.md` and `apps/mobile/README.md` for app-specific details.

