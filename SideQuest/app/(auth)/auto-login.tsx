import * as SplashScreen from "expo-splash-screen";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
  getOnboardingCompleted,
  storeOnboardingCompleted,
} from "@/auth/storage";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { preferencesService } from "@/api/services/preferencesService";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "expo-router";

/**
 * Auto-login component that handles anonymous authentication on app boot
 *
 * FUTURE ENHANCEMENT: This component can be extended to:
 * - Check for existing Apple Sign-In tokens
 * - Offer Apple Sign-In as an option before falling back to anonymous
 * - Handle user choice between Apple Sign-In and anonymous mode
 */
export default function AutoLoginScreen() {
  const { signInAnonymously, user, loading } = useAuth();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [hasEncounteredError, setHasEncounteredError] = useState(false);
  const [authTimeout, setAuthTimeout] = useState<number | null>(null);

  useEffect(() => {
    try {
      console.log("Auto-login useEffect:", {
        user,
        loading,
        isAuthenticating,
        error,
      });

      // Only proceed if we're not loading
      if (loading) {
        console.log("Still loading, waiting...");
        return;
      }

      // If user is already authenticated, navigate accordingly
      if (user) {
        console.log("User authenticated, navigating...");
        handleAuthenticatedUser();
        return;
      }

      // If no user and not loading, check if this is a new user or returning user
      if (!isAuthenticating && !error && !hasEncounteredError) {
        console.log("No authenticated user, checking if returning user...");
        checkIfReturningUser();
      } else if (isAuthenticating) {
        console.log("Already authenticating, waiting...");
      } else if (error || hasEncounteredError) {
        console.log(
          "Authentication error or previous error encountered, showing error state"
        );
      }
    } catch (err) {
      console.error("Unexpected error in auto-login useEffect:", err);
      setError("An unexpected error occurred. Please try again.");
      setHasEncounteredError(true);
    }
  }, [user, loading, isAuthenticating, error, hasEncounteredError]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, [authTimeout]);

  const checkIfReturningUser = async () => {
    try {
      console.log("Checking if user has completed onboarding...");
      const isOnboardingComplete = await getOnboardingCompleted();

      if (isOnboardingComplete) {
        console.log("Returning user detected, attempting authentication...");
        performAnonymousLogin();
      } else {
        console.log("New user detected, going to onboarding...");
        handleNewUser();
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      // If we can't determine status, assume new user
      handleNewUser();
    }
  };

  const performAnonymousLogin = async () => {
    // Prevent multiple authentication attempts
    if (isAuthenticating) {
      console.log("Already authenticating, skipping...");
      return;
    }

    try {
      console.log("Starting anonymous authentication process...");
      setIsAuthenticating(true);
      setError(null);
      setAuthAttempts((prev) => prev + 1);

      // Set a timeout to prevent indefinite loading
      const timeout = setTimeout(() => {
        console.log("Authentication timeout reached");
        setError("Authentication timed out. Please try again.");
        setHasEncounteredError(true);
        setIsAuthenticating(false);
      }, 30000); // 30 second timeout

      setAuthTimeout(timeout);

      // Automatically sign in anonymously
      console.log("Calling signInAnonymously...");
      await signInAnonymously();
      console.log("signInAnonymously completed successfully");

      // Clear timeout on success
      if (timeout) {
        clearTimeout(timeout);
        setAuthTimeout(null);
      }

      // Note: The AuthContext will update the user state,
      // which will trigger the useEffect above to handle navigation
    } catch (err) {
      console.error("Auto-login failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      setHasEncounteredError(true); // Mark that we've encountered an error

      // Clear timeout on error
      if (authTimeout) {
        clearTimeout(authTimeout);
        setAuthTimeout(null);
      }

      // FUTURE ENHANCEMENT: Here we could show options to:
      // - Retry anonymous login
      // - Try Apple Sign-In instead
      // - Show manual login options
    } finally {
      console.log("Setting isAuthenticating to false");
      setIsAuthenticating(false);
    }
  };

  const handleNewUser = async () => {
    try {
      // Hide splash screen
      await SplashScreen.hideAsync();

      // For new users, go directly to onboarding without authentication
      console.log("New user detected, going to onboarding");
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error handling new user:", error);
      router.replace("/onboarding");
    }
  };

  const handleAuthenticatedUser = async () => {
    try {
      // Hide splash screen now that authentication is complete
      await SplashScreen.hideAsync();

      // Check onboarding status from local storage first
      const isOnboardingComplete = await getOnboardingCompleted();

      if (isOnboardingComplete) {
        // User has completed onboarding, go to main app
        router.replace("/(tabs)");
      } else {
        // User needs to complete onboarding
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // If we can't determine onboarding status, go to onboarding as safe fallback
      router.replace("/onboarding");
    }
  };

  // Show loading state while authenticating
  if (isAuthenticating || loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>SideQuest</Text>
          <Text style={styles.subtitle}>Setting up your adventure...</Text>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.spinner}
          />
        </View>
      </View>
    );
  }

  // Show error state if authentication failed
  if (error || hasEncounteredError) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>SideQuest</Text>
          <Text style={styles.subtitle}>Oops! Something went wrong</Text>

          <Text style={styles.errorText}>
            {error ||
              "We encountered an error while setting up your adventure. Don't worry, this happens sometimes!"}
          </Text>

          {/* Add retry button */}
          <Button
            title="Try Again"
            onPress={() => {
              // Clear any existing timeout
              if (authTimeout) {
                clearTimeout(authTimeout);
                setAuthTimeout(null);
              }

              setError(null);
              setIsAuthenticating(false);
              setAuthAttempts(0);
              setHasEncounteredError(false);
            }}
            size="medium"
            style={styles.retryButton}
          />

          <Text style={styles.retryText}>
            Tap "Try Again" to attempt authentication again, or restart the app
            if the problem persists.
          </Text>
        </View>
      </View>
    );
  }

  // This should never be reached, but just in case
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SideQuest</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  spinner: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  retryText: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: "center",
    lineHeight: 20,
  },
});
