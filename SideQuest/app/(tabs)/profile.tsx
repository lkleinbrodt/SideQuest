import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [dailyReminder, setDailyReminder] = React.useState(true);

  const handleResetPreferences = () => {
    Alert.alert(
      "Reset Preferences",
      "This will reset all your quest preferences and start fresh. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            // In real app, this would call API to reset preferences
            Alert.alert(
              "Preferences Reset",
              "Your preferences have been reset."
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("@/assets/raccoon.png")}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.userName}>Profile</Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Notifications Section */}
          {/* <Card variant="default" style={styles.settingsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Morning Reminder</Text>
                <Text style={styles.settingDescription}>
                  Remind me to check quests at 7:00 AM
                </Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: Colors.lightGray, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </Card> */}

          {/* Preferences Section */}
          <Card variant="default" style={styles.settingsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Preferences</Text>
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/settings")}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Advanced Settings</Text>
                <Text style={styles.settingDescription}>
                  Manage all your quest preferences and app settings
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.mutedText}
              />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Layout.spacing.l,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.spacing.m,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.spacing.m,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: "center",
  },
  settingsContainer: {
    padding: Layout.spacing.m,
  },
  settingsCard: {
    marginBottom: Layout.spacing.m,
    padding: Layout.spacing.l,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.spacing.m,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: Layout.spacing.s,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: Layout.spacing.m,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.darkText,
    marginBottom: Layout.spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.mutedText,
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: Layout.spacing.l,
    gap: Layout.spacing.m,
  },
  actionButton: {
    marginBottom: Layout.spacing.s,
  },
  footer: {
    marginTop: Layout.spacing.xl,
    alignItems: "center",
    paddingVertical: Layout.spacing.l,
  },
  footerText: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: "center",
    marginBottom: Layout.spacing.xs,
  },
});
