import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [dailyReminder, setDailyReminder] = React.useState(true);
  const [weeklyReport, setWeeklyReport] = React.useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

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
            <Text style={styles.avatar}>🎯</Text>
          </View>
          <Text style={styles.userName}>{user?.name || "Adventurer"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "adventurer@sidequest.app"}
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Notifications Section */}
          <Card variant="default" style={styles.settingsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Daily Quest Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified when new quests are available
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.lightGray, true: Colors.primary }}
                thumbColor={Colors.white}
              />
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
                disabled={!notificationsEnabled}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Weekly Report</Text>
                <Text style={styles.settingDescription}>
                  Get a summary of your quest completion
                </Text>
              </View>
              <Switch
                value={weeklyReport}
                onValueChange={setWeeklyReport}
                trackColor={{ false: Colors.lightGray, true: Colors.primary }}
                thumbColor={Colors.white}
                disabled={!notificationsEnabled}
              />
            </View>
          </Card>

          {/* Preferences Section */}
          <Card variant="default" style={styles.settingsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Preferences</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Quest Categories</Text>
                <Text style={styles.settingDescription}>
                  Manage which types of quests you prefer
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.mutedText}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Time Preferences</Text>
                <Text style={styles.settingDescription}>
                  Set your preferred quest timing
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.mutedText}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Difficulty Level</Text>
                <Text style={styles.settingDescription}>
                  Adjust quest complexity
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.mutedText}
              />
            </View>
          </Card>

          {/* Data Section */}
          <Card variant="default" style={styles.settingsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Data & Privacy</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Export Data</Text>
                <Text style={styles.settingDescription}>
                  Download your quest history and preferences
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.mutedText}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.settingDescription}>
                  Read our privacy policy
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.mutedText}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Terms of Service</Text>
                <Text style={styles.settingDescription}>
                  Read our terms of service
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.mutedText}
              />
            </View>
          </Card>

          {/* Actions Section */}
          <View style={styles.actionsContainer}>
            <Button
              title="Reset Preferences"
              onPress={handleResetPreferences}
              variant="outline"
              style={styles.actionButton}
            />

            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
              style={styles.actionButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>SideQuest v1.0.0</Text>
            <Text style={styles.footerText}>
              Made with ❤️ for daily adventures
            </Text>
          </View>
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
    backgroundColor: Colors.questCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.spacing.m,
  },
  avatar: {
    fontSize: 40,
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
