# CS Assistant

CS Assistant is a smart digital companion that helps you with goals, reminders, questions, and daily productivity. Built with modern web technologies and enhanced with user authentication for personalized experience.

## Features

### 🔥 Firebase Authentication System
- **Cloud-Based Authentication**: Secure email/password authentication with Firebase Auth
- **Account Creation**: Full signup flow with email validation and password requirements
- **Personalized Experience**: Each user gets their own cloud-stored profile and preferences
- **Admin Controls**: Special admin privileges with automatic email configuration
- **Data Persistence**: User profiles and preferences stored in Firebase Firestore

### 💬 Chat Assistant
- **Intelligent Responses**: AI-powered chat assistant
- **Chat History**: Save and view your conversation history (authenticated users only)
- **Message Management**: Edit and delete your messages
- **Speech Support**: Text-to-speech and speech-to-text capabilities

### 📊 Productivity Dashboard
- **Goals Tracking**: Set and manage personal goals
- **Reminders**: Create and organize reminders
- **History Management**: View organized chat history by date
- **Data Persistence**: All data saved locally for authenticated users

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Themes**: Toggle between themes
- **Customizable Colors**: Personalize accent colors
- **Accessible Interface**: Screen reader friendly with proper ARIA labels

## Getting Started

### Firebase Authentication System

#### Setting Up Firebase
1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com)
2. **Enable Authentication**: Enable Email/Password authentication
3. **Create Firestore Database**: Set up Firestore for user profiles
4. **Get Configuration**: Copy your Firebase config object
5. **Update Config**: Replace the demo config in `firebase-config.js` with your actual Firebase project configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

#### For Regular Users
1. **Sign Up**: Click "Sign Up" to create a new account with email and password
2. **Sign In**: Use your email and password to access your account
3. **Profile Management**: Customize your display name, preferences, and settings
4. **Start Using**: Access all features including goals, reminders, and chat history

#### For Administrators  
- Admin users (username: `RayBen445`) get additional controls:
  - Automatic email configuration: `oladoyeheritage445@gmail.com`
  - Clear all chat history
  - Manage support tickets  
  - System theme controls
  - Advanced settings

#### Data Security
- **Cloud Storage**: All user data securely stored in Firebase Firestore
- **Authentication**: Industry-standard Firebase Auth with email/password
- **Privacy**: User data is isolated per account with proper access controls
- **Admin Security**: Admin privileges validated through Firebase user profiles

### Key Features Usage

#### Chat History
```
✅ Authenticated: Full chat history saved and accessible
❌ Guest: Messages visible during session only
```

#### Goals & Reminders
```
✅ Authenticated: Add, view, and manage personal goals/reminders
❌ Guest: Prompted to sign in when attempting to use
```

#### Admin Features
```
✅ Admin Users: Access to admin panel with system controls
❌ Regular Users: Standard feature set only
```

## Technical Details

### Authentication Implementation
- User accounts managed through Firebase Authentication
- User profiles stored in Firebase Firestore with structure:
  ```json
  {
    "uid": "firebase-user-id",
    "username": "user-chosen-username", 
    "displayName": "User Display Name",
    "email": "user@example.com",
    "isAdmin": false,
    "preferences": {
      "theme": "light",
      "accentColor": "#0078d4",
      "voice": "en-US"
    }
  }
  ```
- Admin status determined by username matching `RayBen445`
- Legacy localStorage migration on first Firebase login

### Data Storage
- **User Profiles**: Firebase Firestore `/users/{uid}` collection
- **Chat History**: `localStorage['chat-history']` (authenticated users only)
- **Goals**: `localStorage['goals']` (authenticated users only)  
- **Reminders**: `localStorage['reminders']` (authenticated users only)
- **Themes**: Per-user preferences in Firebase (authenticated users)

## Installation & Setup

### Development Setup
1. Clone this repository
2. Install dependencies: `npm install` 
3. Set up Firebase (see Firebase Authentication System section above)
4. Update `firebase-config.js` with your Firebase configuration
5. Start development server: `npm run dev`

### Production Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your web hosting service
3. Ensure Firebase configuration is properly set for your domain

### Local Testing
- Open `index.html` directly in a modern web browser
- No build step required for development
- Firebase will work with demo configuration for local testing

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Feel free to contribute to the CS Assistant project! Please ensure all new features maintain the authentication requirements and accessibility standards.

---

*Built with 💙 by Heritage Oladoye and Cool Shot Systems in Nigeria*
