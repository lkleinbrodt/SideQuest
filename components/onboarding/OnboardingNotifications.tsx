import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "@/context/OnboardingContext";

const NOTIFICATION_TIMES = [
  { time: "06:00", label: "6:00 AM" },
  { time: "07:00", label: "7:00 AM" },
  { time: "08:00", label: "8:00 AM" },
  { time: "09:00", label: "9:00 AM" },
];

export const OnboardingNotifications: React.FC = () => {
  const { nextStep, previousStep, updateOnboardingData, state } =
    useOnboarding();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    state.data.notificationTime ? true : false
  );
  const [notificationTime, setNotificationTime] = useState(
    state.data.notificationTime || "07:00"
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleNext = () => {
    updateOnboardingData({
      notificationTime: notificationsEnabled ? notificationTime : undefined,
    });
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Quest Reminders</Text>
          <Text style={styles.subtitle}>
            Get notified when your new quests are ready each morning
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Daily Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive a reminder each morning with your new quests
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + "40" }}
              thumbColor={
                notificationsEnabled ? Colors.primary : Colors.mutedText
              }
            />
          </View>
        </View>

        {notificationsEnabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Time</Text>
              <Text style={styles.sectionDescription}>
                Choose when you'd like to receive your daily quests
              </Text>

              <View style={styles.timeGrid}>
                {NOTIFICATION_TIMES.map((timeOption) => (
                  <TouchableOpacity
                    key={timeOption.time}
                    style={[
                      styles.timeButton,
                      notificationTime === timeOption.time &&
                        styles.timeButtonSelected,
                    ]}
                    onPress={() => setNotificationTime(timeOption.time)}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        notificationTime === timeOption.time &&
                          styles.timeButtonTextSelected,
                      ]}
                    >
                      {timeOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Settings</Text>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Sound</Text>
                  <Text style={styles.settingDescription}>
                    Play a sound when notifications arrive
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{
                    false: Colors.border,
                    true: Colors.primary + "40",
                  }}
                  thumbColor={soundEnabled ? Colors.primary : Colors.mutedText}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Vibration</Text>
                  <Text style={styles.settingDescription}>
                    Vibrate when notifications arrive
                  </Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{
                    false: Colors.border,
                    true: Colors.primary + "40",
                  }}
                  thumbColor={
                    vibrationEnabled ? Colors.primary : Colors.mutedText
                  }
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            You can change these settings anytime in the app. Notifications help
            you build a consistent daily habit of completing quests.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={previousStep}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleNext}
            style={styles.continueButton}
          />
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
    fontSize: 24,
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 16,
    lineHeight: 20,
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
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  timeButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondary,
  },
  timeButtonTextSelected: {
    color: Colors.white,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.questCard,
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
    color: Colors.mutedText,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
});
