# CS Assistant

CS Assistant is a smart digital companion that helps you with goals, reminders, questions, and daily productivity. Built with modern web technologies and enhanced with user authentication for personalized experience.

## Features

### 🔐 User Authentication System
- **Secure Login**: Simple username-based authentication system
- **Personalized Experience**: Each user gets their own space for data
- **Guest Mode**: Browse without authentication, but no data is saved
- **Admin Controls**: Special admin panel for administrative users

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

### Authentication System

#### For Regular Users
1. **Sign In**: Click the "Sign In" button in the header or auth overlay
2. **Create Account**: Enter any username (password optional for demo)
3. **Start Using**: Access all features including goals, reminders, and chat history
4. **Sign Out**: Click "Sign Out" to end your session

#### For Administrators
- Admin users (username: `RayBen445`) get additional controls:
  - Clear all chat history
  - Manage support tickets
  - System theme controls
  - Advanced settings

#### Data Privacy
- **Authenticated Users**: All data (goals, reminders, chat history) is saved locally
- **Guest Users**: No data is persisted; everything is temporary
- **Security**: User credentials stored in browser's localStorage

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
- User accounts stored in `localStorage` with key `csUserAccount`
- Admin status determined by username matching `ADMIN_USERNAME`
- Legacy support for existing `csUserName` storage

### Data Storage
- **Chat History**: `localStorage['chat-history']` (authenticated users only)
- **Goals**: `localStorage['goals']` (authenticated users only)  
- **Reminders**: `localStorage['reminders']` (authenticated users only)
- **Themes**: `localStorage['csTheme']` (all users)
- **Colors**: `localStorage['csAccent']` (all users)

## Installation

1. Clone this repository
2. Open `index.html` in a modern web browser
3. No additional setup required - it's a static web application

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Feel free to contribute to the CS Assistant project! Please ensure all new features maintain the authentication requirements and accessibility standards.

---

*Built with 💙 by Heritage Oladoye and Cool Shot Systems in Nigeria*
