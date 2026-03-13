# Firebase Integration - Visual Reference Guide

## 🎯 Feature Map

```
┌─────────────────────────────────────────────────────────┐
│                   YOJNA AI App                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Entry Point: http://localhost:5173                      │
│       ↓                                                   │
│  ┌─────────────────────────────────┐                     │
│  │    Auth State Check             │                     │
│  │  (onAuthStateChanged)           │                     │
│  └─────────────────────────────────┘                     │
│       ↓                                                   │
│  ┌─────────────────────────────────┐                     │
│  │    Authenticated?               │                     │
│  └─────────────────────────────────┘                     │
│    /        \                                             │
│   NO        YES                                           │
│  /           \                                            │
│ ↓             ↓                                            │
│ LOGIN        PROTECTED                                   │
│ PAGE         ROUTES                                      │
│ (public)     (private)                                   │
│              • Home                                      │
│              • Schemes                                   │
│              • Profile                                   │
│              • Documents                                 │
│              • Voice                                     │
│              • Calculator                                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Login Page Flow

```
┌─ START ──────────────────────────────────────────┐
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Welcome to YOJNA                          │  │
│  │  [Phone Icon]                              │  │
│  │                                             │  │
│  │  Phone Number Input                        │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ +91 98765 43210                    │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                             │  │
│  │  [Send OTP] Button                         │  │
│  └────────────────────────────────────────────┘  │
│           ↓                                       │
│  reCAPTCHA Verification                         │
│           ↓                                       │
│  ┌────────────────────────────────────────────┐  │
│  │  Enter OTP                                 │  │
│  │  (6 digits sent to +91 98765 43210)       │  │
│  │                                             │  │
│  │  OTP Input                                 │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ 0 0 0 0 0 0                        │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                             │  │
│  │  [Verify OTP] [Change Number]              │  │
│  └────────────────────────────────────────────┘  │
│           ↓                                       │
│  Firebase Verification                          │
│           ↓                                       │
│  ┌────────────────────────────────────────────┐  │
│  │  ✅ LOGIN SUCCESSFUL                       │  │
│  │  Redirecting to Home...                    │  │
│  └────────────────────────────────────────────┘  │
│           ↓                                       │
│  Session Created & Stored                       │
│           ↓                                       │
│   [HOME PAGE]                                   │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## 🗄️ Data Flow

```
┌──────────────────────────────────────────────────────┐
│          User Interaction                             │
│          (Phone + OTP)                               │
└────────────────────┬─────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│          reCAPTCHA Verification                       │
│          (Bot Prevention)                             │
└────────────────────┬─────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│      Firebase Authentication API                      │
│      ├─ Send OTP to Phone                            │
│      └─ Verify OTP Code                              │
└────────────────────┬─────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│   Firebase Auth Returns Session Token                │
└────────────────────┬─────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│   Store Session in                                    │
│   ├─ Memory (AuthContext)                            │
│   ├─ Browser Storage (localStorage)                  │
│   └─ Firebase (secure)                               │
└────────────────────┬─────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│   Session Available to Components via                 │
│   useAuth() Hook                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Session Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                 USER LIFECYCLE                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  1. NEW USER                                     │   │
│  │     Opens app → No session stored               │   │
│  └──────────────────────────────────────────────────┘   │
│           ↓                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  2. LOGIN                                        │   │
│  │     Enters phone + OTP → Session created        │   │
│  └──────────────────────────────────────────────────┘   │
│           ↓                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  3. SESSION STORED                              │   │
│  │     localStorage: <encrypted session>            │   │
│  │     Memory: AuthContext state                   │   │
│  └──────────────────────────────────────────────────┘   │
│           ↓                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  4. BROWSING (Protected)                        │   │
│  │     User navigates app → Session checked        │   │
│  │     Each page requires authenticated user       │   │
│  └──────────────────────────────────────────────────┘   │
│           ↓                                             │
│     ┌─────────────────────────────────────┐             │
│     │  RELOAD/RESTART BROWSER             │             │
│     │  ↓                                   │             │
│     │  Session restored from localStorage │             │
│     │  ↓                                   │             │
│     │  onAuthStateChanged fires           │             │
│     │  ↓                                   │             │
│     │  No login needed - stays logged in  │             │
│     └─────────────────────────────────────┘             │
│           ↓                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  5. LOGOUT                                       │   │
│  │     User clicks logout → Session cleared        │   │
│  │     localStorage: <cleared>                      │   │
│  │     Memory: null                                 │   │
│  │     Redirect to login page                       │   │
│  └──────────────────────────────────────────────────┘   │
│           ↓                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  6. NEW SESSION (Can login again)               │   │
│  │     Repeat from step 1                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Component Architecture

```
                     ┌─────────────────┐
                     │   App.tsx       │
                     └────────┬────────┘
                              │
                              ↓
              ┌───────────────────────────────┐
              │     AuthProvider Wrapper       │
              │  (manages auth state)          │
              └────────────┬──────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
      ┌─────────┐   ┌──────────┐   ┌────────────┐
      │ Router  │   │Language  │   │Tooltip     │
      │         │   │Provider  │   │Provider    │
      └────┬────┘   └──────────┘   └────────────┘
           │
    ┌──────┴────────────────────┐
    ↓                            ↓
┌──────────────┐        ┌─────────────────┐
│  LoginPage   │        │ ProtectedRoute  │
│              │        │                 │
│ • Phone      │        │ • Checks auth   │
│ • OTP        │        │ • Redirects     │
│ • reCAPTCHA  │        │ • Loading state │
└──────────────┘        └────────┬────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ↓                         ↓                         ↓
    ┌────────┐           ┌─────────────┐          ┌──────────────┐
    │ Home   │           │  Schemes    │          │  Profile &   │
    │        │           │             │          │  Others      │
    └────────┘           └─────────────┘          └──────────────┘
        ↓                    ↓                     ↓
        └────────────┬───────┴─────────────────────┘
                     ↓
            ┌────────────────┐
            │ useAuth() Hook │
            │                │
            │ • user         │
            │ • loading      │
            │ • logout()     │
            └────────────────┘
```

---

## 📊 State Management

```
┌─────────────────────────────────────────────────┐
│           Firebase Auth State                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  onAuthStateChanged Listener            │   │
│  │  (Runs on app load)                     │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                          │
│     ┌───────────────┼───────────────┐          │
│     ↓               ↓               ↓          │
│  Session        No Session       Loading       │
│  Exists         Available        State         │
│     │               │               │          │
│     ↓               ↓               ↓          │
│   Set User       Set User=null    Show        │
│   in Context     in Context       Spinner     │
│     │               │               │          │
│     └───────────────┴───────────────┘          │
│                     │                          │
│                     ↓                          │
│      ProtectedRoute decides:                  │
│      ├─ User exists? → Show page             │
│      └─ No user? → Redirect to login         │
│                                               │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
┌──────────────────────────────────────────┐
│         Security Architecture             │
├──────────────────────────────────────────┤
│                                          │
│  Layer 1: Frontend                       │
│  ┌────────────────────────────────────┐  │
│  │ • Phone number validation          │  │
│  │ • Input sanitization               │  │
│  │ • Protected routes                 │  │
│  └────────────────────────────────────┘  │
│           ↓                               │
│  Layer 2: reCAPTCHA                      │
│  ┌────────────────────────────────────┐  │
│  │ • Bot detection                    │  │
│  │ • Score-based verification         │  │
│  │ • Invisible to users               │  │
│  └────────────────────────────────────┘  │
│           ↓                               │
│  Layer 3: Firebase Auth                  │
│  ┌────────────────────────────────────┐  │
│  │ • OTP encryption                   │  │
│  │ • Secure transmission (HTTPS)      │  │
│  │ • Rate limiting                    │  │
│  │ • Session management               │  │
│  └────────────────────────────────────┘  │
│           ↓                               │
│  Layer 4: Storage                        │
│  ┌────────────────────────────────────┐  │
│  │ • Encrypted localStorage           │  │
│  │ • Browser-managed encryption       │  │
│  │ • Cannot be accessed via XSS       │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📋 File Structure

```
yojna-ai-helper/
│
├── src/
│   ├── config/
│   │   └── firebase.ts                 ← Firebase init & config
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx             ← Auth state & logic
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx               ← Phone + OTP login
│   │   ├── Index.tsx                   ← Home (protected)
│   │   ├── SchemesPage.tsx             ← Schemes (protected)
│   │   ├── ProfilePage.tsx             ← Profile (protected)
│   │   └── ... (all protected)
│   │
│   ├── components/
│   │   ├── ProtectedRoute.tsx          ← Route guard
│   │   ├── BottomNav.tsx               ← Nav with logout
│   │   └── ...
│   │
│   ├── hooks/
│   │   └── use-auth.ts                 ← Auth hook
│   │
│   └── App.tsx                         ← Updated with auth
│
├── .env.example                        ← Firebase credentials
│
└── Documentation/
    ├── AUTH_README.md                  ← Overview
    ├── FIREBASE_SETUP.md               ← Setup guide
    ├── FIREBASE_AUTH_QUICKSTART.md     ← Quick start
    ├── FIREBASE_TESTING_GUIDE.md       ← Testing guide
    ├── FIREBASE_INTEGRATION_SUMMARY.md ← Summary
    └── IMPLEMENTATION_CHECKLIST.md     ← Checklist
```

---

## ✅ Implementation Status

```
┌─────────────────────────────────────────────┐
│     IMPLEMENTATION STATUS                   │
├─────────────────────────────────────────────┤
│                                             │
│  Firebase Setup          ✅ Complete        │
│  Phone OTP Auth          ✅ Complete        │
│  Session Persistence     ✅ Complete        │
│  Route Protection        ✅ Complete        │
│  User Logout             ✅ Complete        │
│  reCAPTCHA               ✅ Complete        │
│  Error Handling          ✅ Complete        │
│  UI Components           ✅ Complete        │
│  Documentation           ✅ Complete        │
│  Testing Guide           ✅ Complete        │
│  Build & Deployment      ✅ Ready           │
│                                             │
│  Overall Status: ✅ READY TO USE             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Path

```
1. Read AUTH_README.md
   ↓
2. Follow FIREBASE_SETUP.md
   ↓
3. Create .env.local
   ↓
4. Run: npm run dev
   ↓
5. Test with phone: +919876543210
   ↓
6. Test with OTP: 000000
   ↓
7. ✅ App is working!
   ↓
8. See FIREBASE_TESTING_GUIDE.md for more tests
```
