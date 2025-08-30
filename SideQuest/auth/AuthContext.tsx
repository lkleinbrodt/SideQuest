import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getUser,
  removeToken,
  removeUser,
  storeToken,
  storeUser,
} from "./storage";

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  preferences?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (token: string, userData: UserProfile) => Promise<void>;
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

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await removeToken();
      await removeUser();
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
