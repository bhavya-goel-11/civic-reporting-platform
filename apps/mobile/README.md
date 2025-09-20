# Civic Reporting Platform - Mobile App 📱

A React Native mobile application built with Expo that allows citizens to report civic issues in their community. Users can upload photos, describe problems, and automatically capture location data to help local authorities address infrastructure and maintenance issues.

## 🌟 Features

- **📸 Photo Upload**: Capture or select photos of civic issues
- **� Issue Reporting**: Describe problems with detailed text input
- **🗺️ Location Services**: Automatic GPS location detection
- **🔐 User Authentication**: Secure sign-in/sign-up with Supabase
- **🌙 Dark Mode**: Automatic light/dark theme support
- **📱 Cross-Platform**: Works on iOS, Android, and Web

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) (~54.0.7)
- **Navigation**: Expo Router with file-based routing
- **UI**: React Native with custom themed components
- **Backend**: [Supabase](https://supabase.com) for authentication and data storage
- **Image Handling**: Expo Image Picker
- **Location**: Expo Location
- **State Management**: React Hooks

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Expo Go app (for testing on physical devices)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd civic-reporting-platform
   ```

2. **Install dependencies**:
   ```bash
   # From the mobile app directory
   cd apps/mobile
   npm install
   
   # Or from the root directory using workspace
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the mobile app directory
   - Add your Supabase configuration:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Development

#### Option 1: From the mobile app directory
```bash
cd apps/mobile

# Start the development server
npm start

# Or run on specific platforms
npm run android  # Android emulator
npm run ios      # iOS simulator
npm run web      # Web browser
```

#### Option 2: From the root directory (recommended for monorepo)
```bash
# Start the mobile app
npm run mobile:start

# Or run on specific platforms
npm run mobile:android
npm run mobile:ios
npm run mobile:web
```

### Running on Devices

1. **Physical Device**:
   - Install [Expo Go](https://expo.dev/go) on your device
   - Scan the QR code from the terminal

2. **iOS Simulator**:
   - Press `i` in the terminal or run `npm run ios`

3. **Android Emulator**:
   - Press `a` in the terminal or run `npm run android`

4. **Web Browser**:
   - Press `w` in the terminal or run `npm run web`

## 📁 Project Structure

```
apps/mobile/
├── app/                    # File-based routing (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── report.tsx     # Report issue screen
│   │   ├── track.tsx      # Track reports screen
│   │   ├── explore.tsx    # Explore screen
│   │   └── profile.tsx    # Profile screen
│   ├── auth/              # Authentication screens
│   │   ├── SignIn.tsx     # Sign in screen
│   │   └── SignUp.tsx     # Sign up screen
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screens
├── components/            # Reusable components
├── constants/             # Theme and configuration
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
├── assets/                # Images and static files
└── supabase/              # Database schema and security
```

## 🔧 Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in `supabase/` directory:
   - `init.sql` - Database schema
   - `security.sql` - Row Level Security policies
3. Add your Supabase URL and anon key to environment variables

### Permissions

The app requires the following permissions:
- **Camera**: To take photos of issues
- **Photo Library**: To select existing photos
- **Location**: To automatically detect issue location

## 🧪 Development Tips

- **Hot Reload**: Changes are automatically reflected in the app
- **Debugging**: Use Expo DevTools or React Native Debugger
- **Linting**: Run `npm run lint` to check code quality
- **Reset Project**: Run `npm run reset-project` to start fresh

## 📱 Platform-Specific Notes

### iOS
- Requires Xcode for iOS simulator
- Info.plist permissions are pre-configured
- Supports tablets with adaptive UI

### Android
- Requires Android Studio for emulator
- Adaptive icon configuration included
- Edge-to-edge display support

### Web
- Responsive design for browser testing
- Limited native features (camera, location may require polyfills)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test on multiple platforms
4. Submit a pull request

## 📄 License

This project is part of the Civic Reporting Platform monorepo.

---

For more information about the overall platform, see the main repository README.
