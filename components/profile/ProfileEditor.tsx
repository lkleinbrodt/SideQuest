import { QuestCategory, UserProfile } from "@/types/types";
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AdditionalNotesInput } from "./AdditionalNotesInput";
import { CategorySelector } from "./CategorySelector";
import { Colors } from "@/constants/Colors";
import { NotificationSettings } from "./NotificationSettings";
import { getUserTimezone } from "@/utils/timezone";
import { profileService } from "@/api/services/profileService";
import { useAutoSave } from "@/hooks/useAutoSave";

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
  autoSave?: boolean; // Whether to auto-save changes
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
      autoSave = true,
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

    const saveProfile = useCallback(
      async (data: ProfileEditorData) => {
        const updatedProfile = await profileService.updateUserProfile({
          categories: data.categories,
          additionalNotes: data.additionalNotes,
          notificationsEnabled: data.notificationsEnabled,
          notificationTime: data.notificationTime,
          timezone: getUserTimezone(),
        });

        onProfileUpdate?.(updatedProfile);
        return updatedProfile;
      },
      [onProfileUpdate]
    );

    // Use auto-save hook with 2-second debounce (only if autoSave is enabled)
    const { hasUnsavedChanges, isSaving } = useAutoSave({
      data,
      onSave: autoSave
        ? async (data) => {
            await saveProfile(data);
          }
        : async () => {},
      debounceMs: 2000,
      saveOnBlur: true,
      saveOnUnmount: true,
    });

    const updateData = (updates: Partial<ProfileEditorData>) => {
      setData((prev) => ({ ...prev, ...updates }));
    };

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
            onCategoriesChange={(categories: QuestCategory[]) =>
              updateData({ categories })
            }
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
            onChange={(additionalNotes) => updateData({ additionalNotes })}
            compact={compact}
            placeholder="I have a dog. I work from home. I like painting. I am learning Spanish..."
          />
        </View>

        <View style={[styles.section, compact && styles.compactSection]}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <NotificationSettings
            notificationsEnabled={data.notificationsEnabled}
            notificationTime={data.notificationTime}
            onNotificationsChange={(notificationsEnabled) =>
              updateData({ notificationsEnabled })
            }
            onTimeChange={(notificationTime) =>
              updateData({ notificationTime })
            }
            compact={compact}
          />
        </View>

        {autoSave && hasUnsavedChanges && (
          <View style={styles.saveIndicator}>
            <Text style={styles.saveIndicatorText}>
              {isSaving ? "Saving..." : "Unsaved changes"}
            </Text>
          </View>
        )}
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
  saveIndicator: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 16,
  },
  saveIndicatorText: {
    fontSize: 12,
    color: Colors.mutedText,
    fontStyle: "italic",
  },
});
