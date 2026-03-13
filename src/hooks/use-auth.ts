import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * Provides user info, auth methods, and session state
 */
export const useUserAuth = () => {
  return useAuth();
};
