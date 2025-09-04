import { QuestCategory, UserProfile } from "@/types/types";
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AdditionalNotesInput } from "./AdditionalNotesInput";
import { CategorySelector } from "./CategorySelector";
import { Colors } from "@/constants/Colors";
import { NotificationSettings } from "./NotificationSettings";
import { getUserTimezone } from "@/utils/timezone";
import { notificationService } from "@/api/services/notificationService";
import { profileService } from "@/api/services/profileService";

export interface ProfileEditorData {
  categories: QuestCategory[];
  additionalNotes?: string;
  notificationsEnabled: boolean;
  notificationTime: string;
}

export interface ProfileEditorProps {
  profile: UserProfile;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
  showHeader?: boolean;
  headerTitle?: string;
  headerSubtitle?: string | null;
  compact?: boolean;
  onScrollToBottom?: () => void; // For onboarding
}

export const ProfileEditor = forwardRef<ScrollView, ProfileEditorProps>(
  (
    {
      profile,
      onProfileUpdate,
      showHeader = true,
      headerTitle = "Customize Your Experience",
      headerSubtitle = null,
      compact = false,
      onScrollToBottom,
    },
    ref
  ) => {
    const [data, setData] = useState<ProfileEditorData>({
      categories: profile.categories,
      additionalNotes: profile.additionalNotes || "",
      notificationsEnabled: profile.notificationsEnabled,
      notificationTime: profile.notificationTime,
    });
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

    // Update local state when profile changes from server
    useEffect(() => {
      setData({
        categories: profile.categories,
        additionalNotes: profile.additionalNotes || "",
        notificationsEnabled: profile.notificationsEnabled,
        notificationTime: profile.notificationTime,
      });
    }, [profile]);

    // Sync notification settings when profile loads
    useEffect(() => {
      const syncNotificationSettings = async () => {
        try {
          await notificationService.updateNotificationSettings({
            enabled: profile.notificationsEnabled,
            time: profile.notificationTime,
          });
        } catch (error) {
          console.error("Failed to sync notification settings:", error);
        }
      };

      syncNotificationSettings();
    }, [profile.notificationsEnabled, profile.notificationTime]);

    const saveProfile = useCallback(
      async (updates: Partial<ProfileEditorData>) => {
        try {
          const updatedProfile = await profileService.updateUserProfile({
            categories: updates.categories ?? data.categories,
            additionalNotes: updates.additionalNotes ?? data.additionalNotes,
            notificationsEnabled:
              updates.notificationsEnabled ?? data.notificationsEnabled,
            notificationTime: updates.notificationTime ?? data.notificationTime,
            timezone: getUserTimezone(),
          });

          onProfileUpdate?.(updatedProfile);
          return updatedProfile;
        } catch (error) {
          console.error("Failed to save profile:", error);
          // Could add error handling here if needed
        }
      },
      [data, onProfileUpdate]
    );

    const handleCategoriesChange = useCallback(
      async (categories: QuestCategory[]) => {
        setData((prev) => ({ ...prev, categories }));
        await saveProfile({ categories });
      },
      [saveProfile]
    );

    const handleAdditionalNotesChange = useCallback(
      (additionalNotes: string) => {
        setData((prev) => ({ ...prev, additionalNotes }));
      },
      []
    );

    const handleAdditionalNotesBlur = useCallback(async () => {
      await saveProfile({ additionalNotes: data.additionalNotes });
    }, [saveProfile, data.additionalNotes]);

    const handleNotificationsChange = useCallback(
      async (notificationsEnabled: boolean) => {
        setData((prev) => ({ ...prev, notificationsEnabled }));
        await saveProfile({ notificationsEnabled });

        // Update local notification settings
        await notificationService.updateNotificationSettings({
          enabled: notificationsEnabled,
          time: data.notificationTime,
        });
      },
      [saveProfile, data.notificationTime]
    );

    const handleTimeChange = useCallback(
      async (notificationTime: string) => {
        setData((prev) => ({ ...prev, notificationTime }));
        await saveProfile({ notificationTime });

        // Update local notification settings if notifications are enabled
        if (data.notificationsEnabled) {
          await notificationService.updateNotificationSettings({
            enabled: data.notificationsEnabled,
            time: notificationTime,
          });
        }
      },
      [saveProfile, data.notificationsEnabled]
    );

    const handleScroll = (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 20;

      // Check if user has scrolled to the bottom (with some padding)
      const isAtBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
        onScrollToBottom?.();
      }
    };

    return (
      <ScrollView
        ref={ref}
        contentContainerStyle={[
          styles.scrollContent,
          compact && styles.compactScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScrollToBottom ? handleScroll : undefined}
        scrollEventThrottle={onScrollToBottom ? 16 : undefined}
      >
        {showHeader && (
          <View style={[styles.header, compact && styles.compactHeader]}>
            <Text style={[styles.title, compact && styles.compactTitle]}>
              {headerTitle}
            </Text>
            {headerSubtitle && (
              <Text
                style={[styles.subtitle, compact && styles.compactSubtitle]}
              >
                {headerSubtitle}
              </Text>
            )}
          </View>
        )}

        <View style={[styles.section, compact && styles.compactSection]}>
          <Text style={styles.sectionTitle}>Quest Categories</Text>
          <Text style={styles.sectionDescription}>
            Select the types of activities that interest you most
          </Text>
          <CategorySelector
            selectedCategories={data.categories}
            onCategoriesChange={handleCategoriesChange}
            compact={compact}
          />
        </View>

        <View style={[styles.section, compact && styles.compactSection]}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <Text style={styles.sectionDescription}>
            The more you put here, the more tailored the quests will be
          </Text>

          <AdditionalNotesInput
            value={data.additionalNotes || ""}
            onChange={handleAdditionalNotesChange}
            onBlur={handleAdditionalNotesBlur}
            compact={compact}
            placeholder="I have a dog. I work from home. I like painting. I am learning Spanish..."
          />
        </View>

        <View style={[styles.section, compact && styles.compactSection]}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <NotificationSettings
            notificationsEnabled={data.notificationsEnabled}
            notificationTime={data.notificationTime}
            onNotificationsChange={handleNotificationsChange}
            onTimeChange={handleTimeChange}
            compact={compact}
          />
        </View>
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
  },
  compactScrollContent: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  compactHeader: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  compactSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  compactSection: {
    marginBottom: 24,
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
});
