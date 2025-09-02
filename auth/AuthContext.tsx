import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, authService } from "@/api/services/authService";
import {
  getUser,
  removeOnboardingCompleted,
  removeToken,
  removeUser,
  storeToken,
  storeUser,
} from "./storage";

import { QuestPreferences } from "@/types/quest";
import { anonymousAuthService } from "@/api/services/anonymousAuthService";
import { getOrCreateDeviceId } from "@/utils/deviceId";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (token: string, userData: UserProfile) => Promise<void>;
  signInWithApple: (credential: any) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  createUserWithPreferences: (
    preferences: QuestPreferences,
    notificationsEnabled: boolean,
    notificationTime: string,
    timezone: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
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

  // Sign in function
  const signIn = async (token: string, userData: UserProfile) => {
    try {
      setLoading(true);
      setError(null);

      // Store token and user data
      await storeToken(token);
      await storeUser(JSON.stringify(userData));

      setUser(userData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign-In function
  const signInWithApple = async (credential: any) => {
    try {
      setLoading(true);
      setError(null);

      // Call backend API for Apple Sign-In
      const response = await authService.signInWithApple(credential);

      // The auth service returns the data directly (not wrapped in success/data)
      // The API client transforms snake_case to camelCase, so we need to use camelCase field names
      if (!response || !response.accessToken || !response.user) {
        throw new Error("Invalid response: missing access token or user data");
      }

      const { accessToken: access_token, user } = response;

      // Store token and user data
      await storeToken(access_token);
      await storeUser(JSON.stringify(user));

      setUser(user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Apple Sign-In failed";
      setError(errorMessage);
      throw err; // Re-throw to let the calling component handle it
    } finally {
      setLoading(false);
    }
  };

  // Anonymous Sign-In function
  const signInAnonymously = async () => {
    try {
      console.log("AuthContext: Starting anonymous sign-in...");
      setLoading(true);
      setError(null);

      // Get or create device UUID
      console.log("AuthContext: Getting device ID...");
      const deviceId = await getOrCreateDeviceId();
      console.log("AuthContext: Device ID:", deviceId);

      // Call backend API for anonymous sign-in
      console.log("AuthContext: Calling anonymous auth service...");
      const response = await anonymousAuthService.signInAnonymously(deviceId);
      console.log("AuthContext: Response:", response);

      // The anonymous auth service returns the data directly (not wrapped in success/data)
      // The API client transforms snake_case to camelCase, so we need to use camelCase field names
      if (!response || !response.accessToken || !response.user) {
        throw new Error("Invalid response: missing access token or user data");
      }

      const { accessToken: access_token, user } = response;
      console.log("AuthContext: Extracted token and user:", {
        access_token,
        user,
      });

      console.log("AuthContext: Storing token and user data...");

      // Store token and user data
      await storeToken(access_token);
      await storeUser(JSON.stringify(user));

      console.log("AuthContext: Setting user state:", user);
      setUser(user);
      console.log("AuthContext: Anonymous sign-in completed successfully");
    } catch (err) {
      console.error("AuthContext: Anonymous sign-in error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Anonymous sign-in failed";
      setError(errorMessage);
      throw err; // Re-throw to let the calling component handle it
    } finally {
      console.log("AuthContext: Setting loading to false");
      setLoading(false);
    }
  };

  // Create user with preferences (for new users completing onboarding)
  const createUserWithPreferences = async (
    preferences: QuestPreferences,
    notificationsEnabled: boolean,
    notificationTime: string,
    timezone: string
  ) => {
    try {
      console.log("AuthContext: Creating user with preferences...");
      setLoading(true);
      setError(null);

      // Get device UUID
      const deviceId = await getOrCreateDeviceId();
      console.log("AuthContext: Device ID:", deviceId);

      // Create user with preferences
      const response = await anonymousAuthService.createUserWithPreferences(
        deviceId,
        preferences,
        notificationsEnabled,
        notificationTime,
        timezone
      );
      console.log("AuthContext: User created with preferences:", response);

      if (!response || !response.accessToken || !response.user) {
        throw new Error("Invalid response: missing access token or user data");
      }

      const { accessToken: access_token, user } = response;

      // Store token and user data
      await storeToken(access_token);
      await storeUser(JSON.stringify(user));

      setUser(user);
      console.log(
        "AuthContext: User creation with preferences completed successfully"
      );
    } catch (err) {
      console.error("AuthContext: User creation with preferences error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create user with preferences";
      setError(errorMessage);
      throw err; // Re-throw to let the calling component handle it
    } finally {
      setLoading(false);
    }
  };

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
        signIn,
        signInWithApple,
        signInAnonymously,
        createUserWithPreferences,
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
