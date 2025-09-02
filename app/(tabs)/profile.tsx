import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { UserProfile } from "@/types/types";
import { profileService } from "@/api/services/profileService";
import { removeOnboardingCompleted } from "@/auth/storage";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await profileService.getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const handleResetPreferences = async () => {
    try {
      await profileService.resetUserProfile();
      await removeOnboardingCompleted();
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error resetting profile:", error);
    }
  };

  if (loading || !profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

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

        <View style={styles.preferencesContainer}>
          <ProfileEditor
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            showHeader={false}
            compact={true}
            autoSave={true}
          />
        </View>

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
    marginTop: Layout.spacing.m,
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
  preferencesContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: Layout.spacing.m,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Layout.spacing.m,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: Layout.spacing.m,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.mutedText,
    lineHeight: 20,
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
