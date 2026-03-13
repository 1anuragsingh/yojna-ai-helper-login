# Firebase Authentication Testing Guide

## Test Scenarios

### Scenario 1: First Time User Login

**Steps:**
1. Open app in new browser/incognito
2. Should see LoginPage immediately
3. Enter test phone: `+919876543210`
4. Click "Send OTP"
5. Enter OTP: `000000` (in dev mode)
6. Click "Verify OTP"
7. Should redirect to home page

**Expected Result:**
- User logged in
- Can navigate all pages
- Bottom nav shows logout button

---

### Scenario 2: Session Persistence (Refresh)

**Steps:**
1. Login with test phone (see Scenario 1)
2. Navigate to any page
3. Refresh browser (Cmd+R or F5)
4. Wait 2 seconds

**Expected Result:**
- User stays logged in
- No redirect to login
- Same page shown after refresh

---

### Scenario 3: Session Persistence (Close & Reopen)

**Steps:**
1. Login with test phone
2. Close browser tab/window
3. Reopen app in same browser
4. Wait 2 seconds

**Expected Result:**
- User still logged in
- Navigates directly to home
- No login required

---

### Scenario 4: Logout

**Steps:**
1. Login with test phone
2. Click logout icon (bottom right of nav)
3. Click "Logout" in confirmation dialog
4. Wait 2 seconds

**Expected Result:**
- Redirected to login page
- Session cleared
- Must login again to access app

---

### Scenario 5: Invalid Phone Format

**Steps:**
1. Enter invalid phone: `9876543210` (no country code)
2. Click "Send OTP"

**Expected Result:**
- Error message: "Phone number must start with country code"
- No OTP sent
- Phone field still editable

---

### Scenario 6: Invalid OTP

**Steps:**
1. Login up to OTP entry
2. Enter wrong OTP: `111111`
3. Click "Verify OTP"

**Expected Result:**
- Error message: "Invalid OTP"
- Can try again
- OTP field clears

---

### Scenario 7: Expired OTP

**Steps:**
1. Send OTP
2. Wait 10 minutes (or set test to expire faster)
3. Enter correct OTP
4. Click "Verify OTP"

**Expected Result:**
- Error message: "OTP has expired. Please request a new one."
- Can send new OTP

---

### Scenario 8: Protected Route (No Session)

**Steps:**
1. Open app in incognito window
2. Manually navigate to `/schemes` in URL bar
3. Wait 2 seconds

**Expected Result:**
- Redirected to `/login`
- Cannot access protected pages without login

---

### Scenario 9: Changed Phone Number

**Steps:**
1. Enter phone number: `+919876543210`
2. Click "Send OTP"
3. See "Change Number" button
4. Click "Change Number"
5. Enter different phone: `+91XXXXXXXXXX`
6. Send new OTP

**Expected Result:**
- Can change phone before verifying
- New phone OTP sent
- Old OTP invalidated

---

### Scenario 10: Multiple Devices

**Steps:**
1. Login on Desktop
2. Login on Mobile (different browser)
3. Make change on Desktop
4. Check Mobile

**Expected Result:**
- Each device has independent session
- Logout on Desktop doesn't affect Mobile
- Each device must logout separately

---

## Performance Testing

### Page Load Time
```bash
# Test initial load
1. Clear browser cache
2. Open app
3. Check DevTools Network tab
4. Should complete in < 3 seconds
```

### Session Restore Time
```bash
# Test session restoration
1. Login and navigate to schemes
2. Note load time
3. Refresh page
4. Should restore session in < 1 second
```

### Logout Time
```bash
# Test logout performance
1. Click logout
2. Check time to reach login page
3. Should redirect in < 500ms
```

---

## Error Recovery Testing

### Internet Connection Loss During Login

**Steps:**
1. Start login process
2. Turn off internet mid-OTP verification
3. See error message
4. Turn internet back on
5. Retry

**Expected Result:**
- Graceful error handling
- Clear error message
- Can retry after reconnection

---

### Browser Tab in Background

**Steps:**
1. Login on Tab A
2. Keep Tab A in background
3. Wait 30 minutes
4. Switch back to Tab A
5. Interact with app

**Expected Result:**
- Session still valid
- No re-authentication needed
- App works normally

---

### Multiple Tabs Same Browser

**Steps:**
1. Open app in Tab A
2. Login in Tab A
3. Open app in Tab B
4. Should see login page
5. Login in Tab B

**Expected Result:**
- Each tab has independent session
- Both tabs can be logged in
- Logout in Tab A doesn't affect Tab B

---

## Firebase Console Checks

### Monitor Active Sessions
1. Go to Firebase Console
2. Select Authentication
3. Go to "Users" tab
4. Should see test phone number listed
5. Check Last Sign-In time

### Monitor OTP Attempts
1. Go to Firebase Console
2. Select Authentication
3. Go to "Settings"
4. Check OTP verification logs

### Monitor reCAPTCHA
1. Go to Firebase Console
2. Select Authentication
3. Go to "Settings"
4. Check reCAPTCHA scores

---

## Testing Checklist

- [ ] First time user can login
- [ ] Session persists after refresh
- [ ] Session persists after close/reopen
- [ ] Logout works correctly
- [ ] Invalid phone format shows error
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error
- [ ] Cannot access protected routes without login
- [ ] Can change phone before verification
- [ ] Multiple device logins work independently
- [ ] Error messages are clear
- [ ] Loading states show during API calls
- [ ] reCAPTCHA loads invisibly
- [ ] No console errors
- [ ] Performance is acceptable

---

## Production Testing Checklist

- [ ] Test with real phone numbers
- [ ] Test OTP delivery via SMS
- [ ] Test with real Firebase project
- [ ] Verify reCAPTCHA v3 scores
- [ ] Test on actual mobile devices
- [ ] Test offline behavior
- [ ] Test on slow networks
- [ ] Verify security headers
- [ ] Check Firebase security rules
- [ ] Test with VPN/proxy
- [ ] Monitor error rates
- [ ] Check analytics integration

---

## Debugging

### Enable Console Logging
The app logs authentication events:
```
✓ Session restored
✗ Failed to set persistence
✓ OTP sent
✓ OTP verified
✗ Invalid OTP
```

Check browser console (F12 → Console tab) for these logs.

### Check Session Storage
```javascript
// Open browser console and run:
localStorage.getItem('firebase:authUser:...') // Shows encrypted session
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Watch requests to `identitytoolkit.googleapis.com`
4. These are Firebase auth requests

### Monitor Errors
1. Open DevTools → Console
2. Look for red error messages
3. Check `useAuth()` error state in components

---

## Common Test Issues

**Issue: OTP always shows "invalid"**
- Make sure you're using correct test OTP: `000000`
- Check test number is added in Firebase
- Try resending OTP

**Issue: Session not persisting**
- Check localStorage is not disabled
- Check browser privacy settings
- Try clearing cache

**Issue: reCAPTCHA not loading**
- Check domain is in authorized list
- Try adding `localhost:5173` explicitly
- Check Firebase settings saved

**Issue: Wrong phone number after sending OTP**
- Click "Change Number" button
- Enter correct phone
- Request new OTP
