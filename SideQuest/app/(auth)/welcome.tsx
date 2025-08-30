import * as AppleAuthentication from "expo-apple-authentication";

import { Image, Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { preferencesService } from "@/api/services/preferencesService";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isComplete = await preferencesService.isOnboardingComplete();
        if (isComplete) {
          // User has completed onboarding, redirect to main app
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const handleSignIn = async () => {
    try {
      // For now, create a mock user and token
      // In production, this would integrate with Apple Authentication
      const mockToken = "mock-jwt-token";
      const mockUser = {
        id: "user-1",
        name: "Adventurer",
        email: "adventurer@sidequest.app",
        preferences: {},
      };

      await signIn(mockToken, mockUser);

      // Check if user needs to complete onboarding
      const isOnboardingComplete =
        await preferencesService.isOnboardingComplete();
      if (isOnboardingComplete) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎯</Text>
        </View>

        <Text style={styles.title}>SideQuest</Text>
        <Text style={styles.subtitle}>Daily micro-adventures await</Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Start each morning with three personalized quests designed to add
            novelty, productivity, and joy to your day — without guilt or
            pressure.
          </Text>
        </View>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleSignIn}
          />
        )}

        {Platform.OS !== "ios" && (
          <Button
            title="Get Started"
            onPress={handleSignIn}
            size="large"
            style={styles.getStartedButton}
          />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
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
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.questCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logo: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },
  subtitle: {
    fontSize: 18,
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },
  descriptionContainer: {
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },
  appleButton: {
    width: "100%",
    height: 50,
    marginBottom: 16,
  },
  getStartedButton: {
    width: "100%",
    marginBottom: 16,
  },
  footer: {
    position: "absolute",
    bottom: 32 + (Platform.OS === "ios" ? 0 : 16),
    left: 24,
    right: 24,
  },
  footerText: {
    fontSize: 13,
    color: Colors.mutedText,
    textAlign: "center",
    lineHeight: 18,
  },
});
