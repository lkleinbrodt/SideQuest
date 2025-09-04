import React, { createContext, useContext, useState } from "react";
import {
  getOnboardingCompleted,
  removeOnboardingCompleted,
  removeToken,
  removeUser,
  storeOnboardingCompleted,
  storeToken,
  storeUser,
} from "./storage";

import { OnboardingProfile } from "@/types/types";
import { authService } from "@/api/services/authService";
import { getOrCreateDeviceId } from "@/utils/deviceId";
import { notificationService } from "@/api/services/notificationService";

interface AuthContextType {
  user: { id: string } | null;
  onboardingComplete: boolean;
  loading: boolean;
  error: string | null;
  initializeApp: () => Promise<void>;
  signInWithProfile: (profile: OnboardingProfile) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeApp = async () => {
    try {
      setError(null);
      setLoading(true);

      // 1. Initialize notification service
      await notificationService.initialize();

      // 2. Get the unique device ID.
      const deviceId = await getOrCreateDeviceId();

      // 3. Sign in with the backend. The profile is null because the backend will handle
      // creating a new user or logging in an existing one based on the deviceId.
      const response = await authService.signInAnonymously(deviceId, null);
      if (!response || !response.accessToken || !response.user) {
        throw new Error("Invalid response from backend during initial sign-in");
      }

      const { accessToken, user: authUser } = response;
      await storeToken(accessToken);
      await storeUser(JSON.stringify(authUser));
      setUser(authUser);

      // 4. Check local storage to see if onboarding has been completed.
      const isCompleted = await getOnboardingCompleted();
      setOnboardingComplete(isCompleted);
    } catch (err) {
      console.error("AuthContext: Initialization error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Initialization failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithProfile = async (profile: OnboardingProfile) => {
    try {
      setLoading(true);
      setError(null);

      const deviceId = await getOrCreateDeviceId();
      const response = await authService.signInAnonymously(deviceId, profile);

      if (!response || !response.accessToken || !response.user) {
        throw new Error("Invalid response: missing access token or user data");
      }

      const { accessToken, user: authUser } = response;
      await storeToken(accessToken);
      await storeUser(JSON.stringify(authUser));
      setUser(authUser);

      // After successfully saving the profile, mark onboarding as complete.
      await storeOnboardingCompleted(true);
      setOnboardingComplete(true);
    } catch (err) {
      console.error("AuthContext: Sign-in with profile error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save preferences";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await removeToken();
      await removeUser();
      await removeOnboardingCompleted();
      setUser(null);
      setOnboardingComplete(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        onboardingComplete,
        loading,
        error,
        initializeApp,
        signInWithProfile,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
