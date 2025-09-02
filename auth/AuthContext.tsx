import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getUser,
  removeOnboardingCompleted,
  removeToken,
  removeUser,
  storeToken,
  storeUser,
} from "./storage";

import { OnboardingProfile } from "@/types/types";
import { authService } from "@/api/services/authService";
import { getOrCreateDeviceId } from "@/utils/deviceId";

interface AuthContextType {
  user: { id: string } | null; // Minimal user info from auth
  loading: boolean;
  error: string | null;
  signInAnonymously: (profile?: OnboardingProfile | null) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUser();
        if (userData) {
          setUser(JSON.parse(userData));
        }
        // Note: We don't automatically trigger anonymous login here
        // The auto-login component will handle that logic
      } catch (error) {
        console.error("Failed to restore user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Anonymous Sign-In function
  const signInAnonymously = async (
    profile: OnboardingProfile | null = null
  ) => {
    try {
      setLoading(true);
      setError(null);

      const deviceId = await getOrCreateDeviceId();
      const response = await authService.signInAnonymously(deviceId, profile);

      if (!response || !response.accessToken || !response.user) {
        throw new Error("Invalid response: missing access token or user data");
      }

      const { accessToken: access_token, user } = response;

      await storeToken(access_token);
      await storeUser(JSON.stringify(user));

      setUser(user);
    } catch (err) {
      console.error("AuthContext: Anonymous sign-in error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Anonymous sign-in failed";
      setError(errorMessage);
      throw err; // Re-throw to let the calling component handle it
    } finally {
      setLoading(false);
    }
  };

  // Create user with preferences (for new users completing onboarding)

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await removeToken();
      await removeUser();
      await removeOnboardingCompleted();
      setUser(null);
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
        loading,
        error,
        signInAnonymously,
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
