import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { preferencesService } from "@/api/services/preferencesService";
import { useAuth } from "@/auth/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "expo-router";

export const OnboardingCompletion: React.FC = () => {
  const { state, resetOnboarding } = useOnboarding();
  const { user } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCompleteOnboarding = async () => {
    try {
      setIsSaving(true);

      // Save user preferences
      const preferences = {
        categories: state.data.preferredCategories || [
          "fitness",
          "social",
          "mindfulness",
        ],
        difficulty: state.data.preferredDifficulty || "easy",
        maxTime: state.data.maxTimePerQuest || 15,
        includeCompleted: true,
        includeSkipped: false,
        notifications: {
          enabled: !!state.data.notificationTime,
          time: state.data.notificationTime || "07:00",
          sound: true,
          vibration: true,
        },
        theme: "system" as const,
        language: "en",
        accessibility: {
          largeText: false,
          highContrast: false,
        },
      };

      await preferencesService.saveUserPreferences(preferences);
      await preferencesService.completeOnboarding();

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

  const getSelectedCategoriesText = () => {
    const categories = state.data.preferredCategories || [];
    if (categories.length === 0) return "None selected";

    const categoryLabels = {
      fitness: "Fitness",
      social: "Social",
      mindfulness: "Mindfulness",
      hobbies: "Hobbies",
      outdoors: "Outdoors",
      learning: "Learning",
      creativity: "Creativity",
      chores: "Chores",
    };

    return categories.map((cat) => categoryLabels[cat] || cat).join(", ");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Your preferences have been saved and you're ready to start your
            quests
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Preferences</Text>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Quest Categories</Text>
            <Text style={styles.summaryValue}>
              {getSelectedCategoriesText()}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Difficulty Level</Text>
            <Text style={styles.summaryValue}>
              {state.data.preferredDifficulty
                ? state.data.preferredDifficulty.charAt(0).toUpperCase() +
                  state.data.preferredDifficulty.slice(1)
                : "Easy"}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Time Commitment</Text>
            <Text style={styles.summaryValue}>
              {state.data.maxTimePerQuest || 15} minutes per quest
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Daily Notifications</Text>
            <Text style={styles.summaryValue}>
              {state.data.notificationTime
                ? `Enabled at ${state.data.notificationTime}`
                : "Disabled"}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🎯</Text>
          <Text style={styles.infoText}>
            Your first quests will be ready tomorrow morning! You can always
            adjust these settings later in the app.
          </Text>
        </View>

        <Button
          title={isSaving ? "Setting Up..." : "Start My Quests"}
          onPress={handleCompleteOnboarding}
          disabled={isSaving}
          size="large"
          style={styles.button}
        />
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
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 40,
    color: Colors.primary,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  summaryContainer: {
    backgroundColor: Colors.questCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.primary + "10",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },
  button: {
    width: "100%",
  },
});
