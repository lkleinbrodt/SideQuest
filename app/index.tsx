import * as SplashScreen from "expo-splash-screen";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";

import { Colors } from "@/constants/Colors";
import { Error } from "@/components/common/Error";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "expo-router";

// Keep the splash screen visible until we are ready to navigate
SplashScreen.preventAutoHideAsync();

export default function AppLoadingScreen() {
  const { initializeApp, user, onboardingComplete, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Trigger the initialization logic on first render
    initializeApp();
  }, []);

  useEffect(() => {
    // This effect runs when the loading state changes
    if (loading) {
      return; // Do nothing while loading
    }

    if (error) {
      console.error("Error initializing app", error);
    } else if (user && onboardingComplete) {
      // User is authenticated and has finished onboarding
      router.replace("/(tabs)");
    } else {
      // User is new, has not finished onboarding, or an error occurred
      router.replace("/onboarding");
    }

    // Once navigation is decided, hide the splash screen
    SplashScreen.hideAsync();
  }, [user, onboardingComplete, loading, router]);

  // Render a loading indicator. The native splash screen will be visible on top of this.

  if (error) {
    return <Error text="Error initializing app" onRetry={initializeApp} />;
  }
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
});
