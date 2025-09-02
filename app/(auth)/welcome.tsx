import * as AppleAuthentication from "expo-apple-authentication";

import {
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  getOnboardingCompleted,
  storeOnboardingCompleted,
} from "@/auth/storage";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { profileService } from "@/api/services/profileService";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Welcome Screen - Currently replaced by auto-login flow
 *
 * FUTURE ENHANCEMENT: This screen can be re-enabled to offer users a choice between:
 * - Apple Sign-In (for users who want to sync across devices)
 * - Continue anonymously (for users who prefer device-only experience)
 *
 * To re-enable:
 * 1. Uncomment the welcome screen in (auth)/_layout.tsx
 * 2. Modify the auto-login component to redirect here instead of directly to anonymous login
 * 3. Update the auto-login component to show options instead of automatically proceeding
 *
 * Example flow:
 * - Auto-login checks for existing Apple tokens
 * - If found, proceed with Apple auth
 * - If not found, show welcome screen with options
 * - User chooses Apple Sign-In or Continue anonymously
 */
export default function WelcomeScreen() {
  const { signInWithApple, signInAnonymously } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleAnonymousSignIn = async () => {
    try {
      setIsSigningIn(true);

      // Sign in anonymously
      await signInAnonymously();

      // Check onboarding status from local storage
      const isOnboardingComplete = await getOnboardingCompleted();
      if (isOnboardingComplete) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Anonymous sign-in error:", error);

      // Show error to user
      Alert.alert(
        "Sign In Failed",
        "There was an error signing in anonymously. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);

      // Request Apple Sign-In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Authenticate with backend
      await signInWithApple(credential);

      // Check onboarding status from local storage
      const isOnboardingComplete = await getOnboardingCompleted();
      if (isOnboardingComplete) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Sign in error:", error);

      // Handle specific Apple Sign-In errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ERR_CANCELED"
      ) {
        // User cancelled the sign-in
        return;
      }

      // Show error to user
      Alert.alert(
        "Sign In Failed",
        "There was an error signing in with Apple. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/raccoon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>SideQuest</Text>
        <Text style={styles.subtitle}>Adventure awaits</Text>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={8}
            style={[styles.appleButton, isSigningIn && { opacity: 0.5 }]}
            onPress={isSigningIn ? () => {} : handleSignIn}
          />
        )}

        <Button
          title="Continue anonymously"
          onPress={isSigningIn ? () => {} : handleAnonymousSignIn}
          size="medium"
          style={[styles.getStartedButton, isSigningIn && { opacity: 0.5 }]}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{" "}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL("https://www.landonkleinbrodt.com/terms")
              }
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL("https://www.landonkleinbrodt.com/privacy")
              }
            >
              Privacy Policy
            </Text>
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
    width: 360,
    height: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
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
    width: "50%",
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
  link: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});
