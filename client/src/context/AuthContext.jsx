import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap: validate session on app startup
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      // No tokens stored at all → user is not logged in
      if (!authService.hasTokens()) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Proactively refresh to get a valid access token
        const data = await authService.refreshToken();

        if (cancelled) return;

        // Update user state from the fresh response
        const freshUser = {
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          role: data.role,
          profileCompleted: data.profileCompleted,
        };
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
        setIsAuthenticated(true);
      } catch {
        if (cancelled) return;

        // Refresh failed → session is invalid, user must re-authenticate
        authService.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  // Called after successful OTP verification
  const login = useCallback((response) => {
    // Tokens are already stored by authService.verifyOtp
    const userData = {
      userId: response.userId,
      phoneNumber: response.phoneNumber,
      role: response.role,
      profileCompleted: response.profileCompleted,
      isNewUser: response.isNewUser,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Logout: revoke server session + clear local state
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
