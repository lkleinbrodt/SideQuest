import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  UserPreferences,
  preferencesService,
} from "@/api/services/preferencesService";

import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { removeOnboardingCompleted } from "@/auth/storage";
import { useRouter } from "expo-router";

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const profile = await preferencesService.getUserProfile();
      const prefs: UserPreferences = {
        categories: profile.categories,
        difficulty: profile.difficulty,
        maxTime: profile.maxTime,
        includeCompleted: profile.includeCompleted,
        includeSkipped: profile.includeSkipped,
        notifications: {
          enabled: profile.notificationsEnabled,
          time: profile.notificationTime,
          sound: true, // Default values for missing fields
          vibration: true,
        },
        theme: "system" as const, // Default value
        language: "en", // Default value
        accessibility: {
          largeText: false, // Default value
          highContrast: false, // Default value
        },
      };
      setPreferences(prefs);
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    try {
      const updated = { ...preferences, [key]: value } as UserPreferences;
      await preferencesService.updateUserProfile(updated);
      setPreferences(updated);
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  const updateNotificationPreference = async (
    key: keyof UserPreferences["notifications"],
    value: boolean
  ) => {
    if (!preferences) return;

    try {
      const updatedNotifications = {
        ...preferences.notifications,
        [key]: value,
      };
      await preferencesService.updateUserProfile({
        notificationsEnabled: updatedNotifications.enabled,
        notificationTime: updatedNotifications.time,
      });
      setPreferences({ ...preferences, notifications: updatedNotifications });
    } catch (error) {
      console.error("Error updating notification preference:", error);
    }
  };

  const handleResetPreferences = async () => {
    try {
      // Reset user preferences to defaults
      await preferencesService.updateUserProfile({
        categories: ["fitness", "social", "mindfulness"],
        difficulty: "easy",
        maxTime: 15,
        includeCompleted: true,
        includeSkipped: false,
        notificationsEnabled: true,
        notificationTime: "07:00",
        timezone: "UTC",
        onboardingCompleted: false,
      });

      // Clear onboarding completion status from local storage
      await removeOnboardingCompleted();

      // Navigate back to onboarding
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error resetting preferences:", error);
      // If reset fails, still try to go to onboarding
      router.replace("/onboarding");
    }
  };

  if (loading || !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your SideQuest experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quest Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Include Completed Quests</Text>
              <Text style={styles.settingDescription}>
                Show completed quests in your history
              </Text>
            </View>
            <Switch
              value={preferences.includeCompleted}
              onValueChange={(value) =>
                updatePreference("includeCompleted", value)
              }
              trackColor={{ false: Colors.border, true: Colors.primary + "40" }}
              thumbColor={
                preferences.includeCompleted ? Colors.primary : Colors.mutedText
              }
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Include Skipped Quests</Text>
              <Text style={styles.settingDescription}>
                Show skipped quests in your history
              </Text>
            </View>
            <Switch
              value={preferences.includeSkipped}
              onValueChange={(value) =>
                updatePreference("includeSkipped", value)
              }
              trackColor={{ false: Colors.border, true: Colors.primary + "40" }}
              thumbColor={
                preferences.includeSkipped ? Colors.primary : Colors.mutedText
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Daily Quest Reminders</Text>
              <Text style={styles.settingDescription}>
                Receive notifications for new quests
              </Text>
            </View>
            <Switch
              value={preferences.notifications.enabled}
              onValueChange={(value) =>
                updateNotificationPreference("enabled", value)
              }
              trackColor={{ false: Colors.border, true: Colors.primary + "40" }}
              thumbColor={
                preferences.notifications.enabled
                  ? Colors.primary
                  : Colors.mutedText
              }
            />
          </View>
        </View>

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingDescription}>
                Choose your preferred theme
              </Text>
            </View>
            <TouchableOpacity
              style={styles.themeButton}
              onPress={() => {
                // Cycle through themes
                const themes: UserPreferences["theme"][] = [
                  "light",
                  "dark",
                  "system",
                ];
                const currentIndex = themes.indexOf(preferences.theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                updatePreference("theme", nextTheme);
              }}
            >
              <Text style={styles.themeButtonText}>
                {preferences.theme.charAt(0).toUpperCase() +
                  preferences.theme.slice(1)}
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleResetPreferences}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Reset Preferences</Text>
              <Text style={styles.settingDescription}>
                Reset your quest preferences to default
              </Text>
            </View>
            <Text style={styles.signOutText}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.mutedText,
    lineHeight: 20,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  themeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  signOutText: {
    fontSize: 18,
    color: Colors.error || "#FF3B30",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.mutedText,
  },
});
