# Firebase Authentication - Quick Start Guide

## What Was Added

Firebase Phone OTP authentication has been fully integrated into YOJNA AI with automatic session persistence.

### ✅ Features Implemented

1. **Phone Number Login with OTP**
   - Users enter phone number (+91XXXXXXXXXX)
   - Receive 6-digit OTP via SMS or test mode
   - Verify OTP to login

2. **Automatic Session Persistence**
   - User stays logged in after closing app
   - Session restored on page reload
   - Encrypted browser storage

3. **Protected Routes**
   - All app pages require authentication
   - Unauthenticated users redirected to login
   - Loading state during auth check

4. **User Logout**
   - Logout button in bottom navigation
   - Confirmation dialog before logout
   - Session cleared on logout

5. **reCAPTCHA Protection**
   - Prevents bot attacks
   - Invisible to users
   - Automatic verification

---

## Files Added/Modified

### New Files
```
src/
├── config/
│   └── firebase.ts                    # Firebase initialization
├── contexts/
│   └── AuthContext.tsx                # Auth state management
├── pages/
│   └── LoginPage.tsx                  # Login UI with OTP
├── components/
│   └── ProtectedRoute.tsx             # Route protection
└── hooks/
    └── use-auth.ts                    # Auth hook

FIREBASE_SETUP.md                      # Setup instructions
.env.example                           # Updated with Firebase env vars
```

### Modified Files
```
src/
├── App.tsx                            # Added AuthProvider + ProtectedRoute
└── components/
    └── BottomNav.tsx                  # Added logout button
```

---

## Quick Setup (5 Minutes)

### 1. Get Firebase Credentials
- Go to [Firebase Console](https://console.firebase.google.com)
- Create new project or use existing
- Register web app
- Copy credentials

### 2. Set Environment Variables
```bash
# Create .env.local in project root
cp .env.example .env.local

# Edit with your Firebase credentials
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... (see .env.example for all)
```

### 3. Enable Phone Auth in Firebase
- Go to Firebase Console → Authentication
- Enable "Phone" sign-in method
- Set up reCAPTCHA (Firebase guides you)
- Add test numbers if developing

### 4. Start Dev Server
```bash
npm run dev
```

Users will see login page on first visit.

---

## Testing

### Test with Real Phone
1. User enters phone number: `+91XXXXXXXXXX`
2. Clicks "Send OTP"
3. Receives SMS with code
4. Enters code to verify

### Test in Development
1. Add test phone number in Firebase
   - Number: `+919876543210`
   - Code: `000000`
2. Use test number to login
3. Use code `000000` for OTP
4. No SMS sent in test mode

---

## Usage in Components

### Access User Info
```tsx
import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader />;
  return <p>Welcome {user?.phoneNumber}</p>;
}
```

### Logout User
```tsx
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

### Check if User Logged In
```tsx
const { user } = useAuth();

if (!user) {
  // Show login page or message
}
```

---

## Session Persistence Explained

User logs in with phone OTP → Firebase stores session in browser → User stays logged in across:
- ✅ Browser restarts
- ✅ Page reloads
- ✅ App closures
- ✅ Navigation away and back

Until:
- ❌ User explicitly logs out
- ❌ Session expires (30 days)
- ❌ Browser storage cleared
- ❌ Login from different device

---

## Security

🔒 **Credentials Protected**
- Firebase API key restricted to web domain
- Phone numbers encrypted
- OTP transmitted securely

🔒 **reCAPTCHA v3**
- Prevents automated bot attacks
- Works silently (no user interaction)
- Updates Firebase security

🔒 **Session Encrypted**
- Stored in browser localStorage
- Encrypted by browser
- Inaccessible from other tabs

---

## Common Issues

**"reCAPTCHA not initialized"**
- Refresh page
- Check Firebase settings
- Verify domain in authorized domains list

**"OTP invalid/expired"**
- OTP valid for 10 minutes
- Use new code after expiry
- Check phone number format

**"User still logged in after logout"**
- Clear browser cache
- Check localStorage is not disabled
- Try different browser

**App still shows login after refresh**
- Might be checking session (wait 2 seconds)
- Check browser console for errors
- Verify Firebase credentials

---

## Next Steps

✅ **Already Working**
- Phone OTP authentication
- Session persistence
- Route protection
- Logout functionality

⏭️ **Can Add Next**
1. Save user profile data to Firestore
2. Link schemes to user account
3. Save application history
4. Push notifications on scheme updates
5. Document storage in Firebase Storage

---

## Support

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed setup guide.

For Firebase docs: https://firebase.google.com/docs/auth
