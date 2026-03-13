# Firebase Authentication Setup Guide

## Overview
This guide explains how to set up Firebase Authentication with Phone OTP login for the YOJNA AI app.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: `yojna-ai-helper`
4. Accept terms and create project
5. Wait for project creation to complete

## Step 2: Register Your Web App

1. In Firebase Console, click the **Web** icon to register a web app
2. Enter app nickname: `YOJNA AI`
3. Click "Register app"
4. Copy the Firebase configuration object

## Step 3: Enable Phone Authentication

1. Go to **Authentication** in left sidebar
2. Click **Sign-in method** tab
3. Click **Phone** from the sign-in providers list
4. Enable it (toggle ON)
5. Save changes

## Step 4: Configure reCAPTCHA

1. Still in Authentication → Sign-in method
2. Scroll to **reCAPTCHA enterprise** or **reCAPTCHA v3**
3. If not configured, Firebase will prompt you to set it up
4. Complete the setup as directed

## Step 5: Add Environment Variables

1. Create `.env.local` file in project root
2. Copy contents from `.env.example`:
```bash
cp .env.example .env.local
```

3. Update with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=yojna-ai-helper.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yojna-ai-helper
VITE_FIREBASE_STORAGE_BUCKET=yojna-ai-helper.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

**Where to find these values:**
- Go to Firebase Console → Project Settings (gear icon)
- Select your web app
- Copy the configuration under "firebaseConfig"

## Step 6: Allow Development URLs

1. Go to **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add these domains:
   - `localhost`
   - `localhost:5173` (or your dev port)
   - Your production domain (when deployed)

## Step 7: Test Numbers (Development)

Firebase allows you to add test phone numbers:

1. Go to **Authentication** → **Settings**
2. Scroll to **Test phone numbers and verification codes**
3. Add test numbers:
   - Number: `+919876543210` (any valid format)
   - Code: `000000` (6 digits)

Users can now login with these test numbers without receiving actual SMS.

## Step 8: Install Dependencies

Dependencies are already installed, but if needed:
```bash
npm install firebase --legacy-peer-deps
```

## How It Works

### Login Flow
```
User enters phone number (+91XXXXXXXXXX)
    ↓
Click "Send OTP"
    ↓
reCAPTCHA verification
    ↓
Firebase sends OTP (or test code in dev)
    ↓
User enters OTP
    ↓
Click "Verify OTP"
    ↓
Firebase confirms OTP
    ↓
User logged in + session persisted
```

### Session Persistence
- Uses `browserLocalPersistence` - user stays logged in across browser restarts
- Session stored in browser's localStorage
- Automatically restored on app reload
- User sent to login page if session expired

### Protected Routes
All app pages except `/login` require authentication:
- User redirected to `/login` if not authenticated
- Loading state shown while checking auth
- User info accessible via `useAuth()` hook

## Files Created

1. **[src/config/firebase.ts](src/config/firebase.ts)** - Firebase initialization
2. **[src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)** - Auth state management
3. **[src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)** - Login UI
4. **[src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)** - Route protection
5. **[src/hooks/use-auth.ts](src/hooks/use-auth.ts)** - Auth hook
6. **.env.example** - Environment variables template

## Usage in Components

### Get Current User
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, error } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return <div>Welcome {user?.phoneNumber}!</div>;
}
```

### Logout
```tsx
const { logout } = useAuth();

await logout();
```

### Send OTP
```tsx
const { sendOTP } = useAuth();

await sendOTP('+919876543210');
```

### Verify OTP
```tsx
const { verifyOTP } = useAuth();

await verifyOTP('000000');
```

## Troubleshooting

### "reCAPTCHA not initialized"
- Ensure reCAPTCHA is enabled in Firebase Authentication settings
- Check that you're using localhost or authorized domain
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### OTP not being sent
- Verify phone number format: `+` followed by country code + number
- Add phone to test numbers if in development mode
- Check Firebase project has phone auth enabled

### User not persisting after reload
- Check browser localStorage is not disabled
- Verify browserLocalPersistence is set in firebase.ts
- Check browser console for auth errors

### Session lost after navigation
- Ensure ProtectedRoute wraps all pages
- Check AuthProvider wraps entire app
- Verify onAuthStateChanged listener is set up in AuthContext

## Production Checklist

- [ ] Set production Firebase project credentials in `.env.local`
- [ ] Remove test phone numbers from Firebase
- [ ] Add production domain to authorized domains
- [ ] Set up real SMS provider (Twilio, etc.) if needed
- [ ] Enable reCAPTCHA v3 (not just enterprise)
- [ ] Test complete login flow in production
- [ ] Set up Firebase security rules for user data
- [ ] Monitor Firebase authentication logs

## Security Notes

🔒 **Never commit `.env.local` to git**
- Add to `.gitignore` (already done)
- Keep credentials private
- Use different credentials for dev/prod

🔒 **reCAPTCHA Protection**
- Enabled to prevent brute force attacks
- Automatically handles bot detection
- Invisible to legitimate users

🔒 **Phone Number Format**
- Must include country code (+91 for India)
- Validated before sending OTP
- Securely transmitted to Firebase

## Support Resources

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Phone Authentication Guide](https://firebase.google.com/docs/auth/web/phone-auth)
- [Session Persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence)
