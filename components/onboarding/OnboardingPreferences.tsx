import {
  ProfileEditor,
  ProfileEditorData,
} from "@/components/profile/ProfileEditor";
import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { OnboardingProfile } from "@/types/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserTimezone } from "@/utils/timezone";
import { storeOnboardingCompleted } from "@/auth/storage";
import { useAuth } from "@/auth/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "expo-router";

export const OnboardingPreferences: React.FC = () => {
  const { nextStep, previousStep, updateOnboardingData, state } =
    useOnboarding();
  const { resetOnboarding } = useOnboarding();
  const { signInWithProfile } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [preferencesData, setPreferencesData] = useState<ProfileEditorData>({
    categories: state.profile.categories || [
      "fitness",
      "social",
      "mindfulness",
      "hobbies",
      "outdoors",
      "learning",
      "creativity",
      "chores",
    ],
    additionalNotes: state.profile.additionalNotes || "",
    notificationsEnabled: state.profile.notificationsEnabled ?? true,
    notificationTime: state.profile.notificationTime || "08:00",
  });

  const handleCompleteOnboarding = async () => {
    try {
      setIsSaving(true);

      // Get user's timezone
      const userTimezone = getUserTimezone();

      // Convert partial profile to full OnboardingProfile with defaults
      const profile: OnboardingProfile = {
        categories: preferencesData.categories,
        difficulty: "easy", // Default difficulty
        maxTime: 15, // Default max time
        additionalNotes: preferencesData.additionalNotes,
        includeCompleted: true,
        includeSkipped: false,
        notificationsEnabled: preferencesData.notificationsEnabled,
        notificationTime: preferencesData.notificationTime,
        timezone: userTimezone,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await signInWithProfile(profile);

      // Store onboarding completion status in local storage
      await storeOnboardingCompleted(true);

      // Reset onboarding context
      resetOnboarding();

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // In a real app, you'd show an error message
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleButtonPress = () => {
    if (!hasScrolledToBottom) {
      scrollToBottom();
    } else {
      handleCompleteOnboarding();
    }
  };

  console.log("selected categories", preferencesData.categories);

  return (
    <SafeAreaView style={styles.container}>
      <ProfileEditor
        ref={scrollViewRef}
        profile={{
          id: "temp",
          categories: preferencesData.categories,
          additionalNotes: preferencesData.additionalNotes,
          notificationsEnabled: preferencesData.notificationsEnabled,
          notificationTime: preferencesData.notificationTime,
          timezone: getUserTimezone(),
          difficulty: "easy",
          maxTime: 15,
          includeCompleted: true,
          includeSkipped: false,
          onboardingCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onProfileUpdate={(updatedProfile) => {
          setPreferencesData({
            categories: updatedProfile.categories,
            additionalNotes: updatedProfile.additionalNotes,
            notificationsEnabled: updatedProfile.notificationsEnabled,
            notificationTime: updatedProfile.notificationTime,
          });
        }}
        showHeader={true}
        headerTitle="Customize Your Experience"
        compact={false}
        onScrollToBottom={() => setHasScrolledToBottom(true)}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={
            !hasScrolledToBottom ? "↓" : isSaving ? "Setting Up..." : "Complete"
          }
          onPress={handleButtonPress}
          disabled={isSaving}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 24,
    paddingTop: 16,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
});
