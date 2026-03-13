import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  confirmationResult: ConfirmationResult | null;
  setConfirmationResult: (result: ConfirmationResult | null) => void;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Restore session on app load
  useEffect(() => {
    // Check for test/mock user first
    const testUserJson = localStorage.getItem('test_user');
    if (testUserJson) {
      try {
        const testUser = JSON.parse(testUserJson);
        setUser(testUser);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Error restoring test user:', err);
      }
    }

    // Then check Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendOTP = async (phone: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Validate phone number format
      if (!phone.startsWith('+')) {
        throw new Error('Phone number must start with country code (e.g., +91)');
      }
      
      if (!/^\+\d{1,3}\d{4,14}$/.test(phone)) {
        throw new Error('Invalid phone number format');
      }

      // Check if using test/demo mode
      if (phone === '+919876543210') {
        console.log('🧪 Using test mode - OTP will be 000000');
        setPhoneNumber(phone);
        setConfirmationResult({} as any); // Mock confirmation
        return;
      }

      // For testing in development, you might need to configure reCAPTCHA
      try {
        const recaptchaVerifier = (window as any).recaptchaVerifier;
        if (!recaptchaVerifier) {
          throw new Error('reCAPTCHA not initialized. Please ensure Phone Authentication is enabled in Firebase Console.');
        }
        const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
        setConfirmationResult(result);
        setPhoneNumber(phone);
      } catch (firebaseError: any) {
        if (firebaseError.code === 'auth/configuration-not-found') {
          throw new Error('Phone Authentication is not enabled in your Firebase project. Please enable it in Firebase Console → Authentication → Sign-in method.');
        }
        throw firebaseError;
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      setError(null);
      setLoading(true);

      if (!confirmationResult) {
        throw new Error('No OTP request found. Please send OTP first.');
      }

      if (!otp || otp.length !== 6) {
        throw new Error('OTP must be 6 digits');
      }

      // Handle test mode (empty confirmationResult means mock)
      if (!confirmationResult.confirm) {
        if (otp === '000000') {
          console.log('🧪 Test mode: OTP verified! Creating mock user session...');
          // Create a mock user for testing
          const mockUser = {
            uid: 'test-user-' + Date.now(),
            phoneNumber: phoneNumber,
            email: null,
            displayName: null,
            emailVerified: false,
            isAnonymous: false,
            metadata: {},
            getIdToken: async () => 'test-token',
          } as any;
          
          // Store mock user in localStorage
          localStorage.setItem('test_user', JSON.stringify(mockUser));
          
          // Trigger auth state change
          setUser(mockUser);
          setConfirmationResult(null);
          setPhoneNumber('');
          return;
        } else {
          throw new Error('Invalid OTP. For testing, use 000000');
        }
      }

      // Real Firebase verification
      try {
        await confirmationResult.confirm(otp);
        setConfirmationResult(null);
        setPhoneNumber('');
      } catch (firebaseError: any) {
        if (firebaseError.code === 'auth/invalid-verification-code') {
          throw new Error('Invalid OTP. Please check and try again.');
        }
        if (firebaseError.code === 'auth/code-expired') {
          throw new Error('OTP has expired. Please request a new one.');
        }
        throw firebaseError;
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      const errorMessage = err.message || 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Clear test/mock user
      localStorage.removeItem('test_user');
      
      // Sign out from Firebase if user exists
      if (user) {
        await signOut(auth);
      }
      
      setUser(null);
      setPhoneNumber('');
      setConfirmationResult(null);
    } catch (err: any) {
      console.error('Error logging out:', err);
      setError(err.message || 'Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    phoneNumber,
    setPhoneNumber,
    confirmationResult,
    setConfirmationResult,
    sendOTP,
    verifyOTP,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
