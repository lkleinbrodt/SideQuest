import {
  BackendUserPreferences,
  QuestCategory,
  QuestDifficulty,
  QuestPreferences,
} from "@/types/quest";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS } from "../config";
import { apiClient } from "../client";

const PREFERENCES_STORAGE_KEY = "@sidequest:user_preferences";
const ONBOARDING_COMPLETE_KEY = "@sidequest:onboarding_complete";

export interface UserPreferences extends QuestPreferences {
  notifications: {
    enabled: boolean;
    time: string; // HH:MM format
    sound: boolean;
    vibration: boolean;
  };
  theme: "light" | "dark" | "system";
  language: string;
  accessibility: {
    largeText: boolean;
    highContrast: boolean;
  };
}

export interface OnboardingData {
  name: string;
  interests: string[];
  preferredCategories: QuestCategory[];
  preferredDifficulty: QuestDifficulty;
  maxTimePerQuest: number;
  notificationTime: string;
}

class PreferencesService {
  private static instance: PreferencesService;
  private defaultPreferences: UserPreferences;

  private constructor() {
    this.defaultPreferences = {
      categories: ["fitness", "social", "mindfulness", "hobbies", "outdoors"],
      difficulty: "easy",
      maxTime: 15,
      includeCompleted: true,
      includeSkipped: false,
      notifications: {
        enabled: true,
        time: "07:00",
        sound: true,
        vibration: true,
      },
      theme: "system",
      language: "en",
      accessibility: {
        largeText: false,
        highContrast: false,
      },
    };
  }

  public static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
  }

  /**
   * Convert frontend preferences to backend format
   */
  private convertPreferencesToBackend(preferences: QuestPreferences) {
    return {
      categories: preferences.categories,
      difficulty: preferences.difficulty,
      max_time: preferences.maxTime,
      include_completed: preferences.includeCompleted,
      include_skipped: preferences.includeSkipped,
    };
  }

  /**
   * Convert backend preferences to frontend format
   */
  private convertPreferencesFromBackend(
    backendPrefs: BackendUserPreferences
  ): QuestPreferences {
    return {
      categories: backendPrefs.categories,
      difficulty: backendPrefs.difficulty,
      maxTime: backendPrefs.max_time,
      includeCompleted: backendPrefs.include_completed,
      includeSkipped: backendPrefs.include_skipped,
    };
  }

  /**
   * Get user preferences from backend, fallback to local storage
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      // Try to get from backend first
      const response = await apiClient.get<{
        success: boolean;
        data?: BackendUserPreferences;
      }>(ENDPOINTS.PREFERENCES);

      if (response.ok && response.data?.success && response.data.data) {
        const backendPrefs = response.data.data;
        const questPrefs = this.convertPreferencesFromBackend(backendPrefs);

        // Merge with local preferences for non-quest settings
        const localPrefs = await this.getLocalPreferences();

        const mergedPrefs: UserPreferences = {
          ...this.defaultPreferences,
          ...localPrefs,
          ...questPrefs,
          notifications: {
            ...localPrefs.notifications,
            enabled: backendPrefs.notifications_enabled,
            time: backendPrefs.notification_time,
          },
        };

        // Save merged preferences locally
        await this.saveLocalPreferences(mergedPrefs);
        return mergedPrefs;
      }
    } catch (error) {
      console.error("Error fetching preferences from backend:", error);
    }

    // Fallback to local storage
    return this.getLocalPreferences();
  }

  /**
   * Get preferences from local storage only
   */
  private async getLocalPreferences(): Promise<UserPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...this.defaultPreferences, ...parsed };
      }
      return this.defaultPreferences;
    } catch (error) {
      console.error("Error loading local preferences:", error);
      return this.defaultPreferences;
    }
  }

  /**
   * Save preferences to both backend and local storage
   */
  async saveUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    try {
      const current = await this.getUserPreferences();
      const updated = { ...current, ...preferences };

      // Save quest preferences to backend
      if (this.hasQuestPreferencesChanged(current, updated)) {
        const questPrefs = {
          categories: updated.categories,
          difficulty: updated.difficulty,
          max_time: updated.maxTime,
          include_completed: updated.includeCompleted,
          include_skipped: updated.includeSkipped,
        };

        const backendResponse = await apiClient.put(
          ENDPOINTS.PREFERENCES,
          questPrefs
        );
        if (!backendResponse.ok) {
          console.warn(
            "Failed to save preferences to backend, saving locally only"
          );
        }
      }

      // Save all preferences locally
      await this.saveLocalPreferences(updated);
      return true;
    } catch (error) {
      console.error("Error saving user preferences:", error);
      // Try to save locally as fallback
      try {
        const current = await this.getUserPreferences();
        const updated = { ...current, ...preferences };
        await this.saveLocalPreferences(updated);
        return true;
      } catch (localError) {
        console.error("Error saving preferences locally:", localError);
        return false;
      }
    }
  }

  /**
   * Save preferences to local storage only
   */
  private async saveLocalPreferences(
    preferences: UserPreferences
  ): Promise<void> {
    await AsyncStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
  }

  /**
   * Check if quest preferences have changed
   */
  private hasQuestPreferencesChanged(
    current: UserPreferences,
    updated: UserPreferences
  ): boolean {
    return (
      JSON.stringify(current.categories) !==
        JSON.stringify(updated.categories) ||
      current.difficulty !== updated.difficulty ||
      current.maxTime !== updated.maxTime ||
      current.includeCompleted !== updated.includeCompleted ||
      current.includeSkipped !== updated.includeSkipped
    );
  }

  /**
   * Update specific preference values
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<boolean> {
    return this.saveUserPreferences(updates);
  }

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(): Promise<boolean> {
    try {
      // Reset on backend
      try {
        await apiClient.put(ENDPOINTS.PREFERENCES, {
          categories: this.defaultPreferences.categories,
          difficulty: this.defaultPreferences.difficulty,
          max_time: this.defaultPreferences.maxTime,
          include_completed: this.defaultPreferences.includeCompleted,
          include_skipped: this.defaultPreferences.includeSkipped,
        });
      } catch (error) {
        console.warn("Failed to reset preferences on backend:", error);
      }

      // Reset locally
      await AsyncStorage.removeItem(PREFERENCES_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error resetting preferences:", error);
      return false;
    }
  }

  /**
   * Check if onboarding is complete from backend, fallback to local storage
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      // Try to get from backend first
      const response = await apiClient.get<{
        success: boolean;
        data?: BackendUserPreferences;
      }>(ENDPOINTS.PREFERENCES);

      if (response.ok && response.data?.success && response.data.data) {
        return response.data.data.onboarding_completed;
      }
    } catch (error) {
      console.error("Error checking onboarding status from backend:", error);
    }

    // Fallback to local storage
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return stored === "true";
    } catch (error) {
      console.error("Error checking local onboarding status:", error);
      return false;
    }
  }

  /**
   * Mark onboarding as complete on both backend and locally
   */
  async completeOnboarding(): Promise<boolean> {
    try {
      // Mark complete on backend
      try {
        const response = await apiClient.post(
          ENDPOINTS.ONBOARDING_COMPLETE,
          {}
        );
        if (!response.ok) {
          console.warn("Failed to mark onboarding complete on backend");
        }
      } catch (error) {
        console.warn("Error marking onboarding complete on backend:", error);
      }

      // Mark complete locally
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
      return true;
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
      return false;
    }
  }

  /**
   * Get quest preferences specifically
   */
  async getQuestPreferences(): Promise<QuestPreferences> {
    const preferences = await this.getUserPreferences();
    console.log("Getting quest preferences:", preferences);
    return {
      categories: preferences.categories,
      difficulty: preferences.difficulty,
      maxTime: preferences.maxTime,
      includeCompleted: preferences.includeCompleted,
      includeSkipped: preferences.includeSkipped,
    };
  }

  /**
   * Update quest preferences
   */
  async updateQuestPreferences(
    updates: Partial<QuestPreferences>
  ): Promise<boolean> {
    const current = await this.getQuestPreferences();
    const updated = { ...current, ...updates };
    return this.saveUserPreferences(updated);
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences() {
    const preferences = await this.getUserPreferences();
    return preferences.notifications;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    updates: Partial<UserPreferences["notifications"]>
  ): Promise<boolean> {
    const current = await this.getUserPreferences();
    const updatedNotifications = { ...current.notifications, ...updates };
    return this.saveUserPreferences({ notifications: updatedNotifications });
  }

  /**
   * Get theme preference
   */
  async getThemePreference(): Promise<"light" | "dark" | "system"> {
    const preferences = await this.getUserPreferences();
    return preferences.theme;
  }

  /**
   * Update theme preference
   */
  async updateThemePreference(
    theme: "light" | "dark" | "system"
  ): Promise<boolean> {
    return this.saveUserPreferences({ theme });
  }

  /**
   * Get accessibility preferences
   */
  async getAccessibilityPreferences() {
    const preferences = await this.getUserPreferences();
    return preferences.accessibility;
  }

  /**
   * Update accessibility preferences
   */
  async updateAccessibilityPreferences(
    updates: Partial<UserPreferences["accessibility"]>
  ): Promise<boolean> {
    const current = await this.getUserPreferences();
    const updatedAccessibility = { ...current.accessibility, ...updates };
    return this.saveUserPreferences({ accessibility: updatedAccessibility });
  }

  /**
   * Export preferences for backup
   */
  async exportPreferences(): Promise<string> {
    try {
      const preferences = await this.getUserPreferences();
      return JSON.stringify(preferences, null, 2);
    } catch (error) {
      console.error("Error exporting preferences:", error);
      throw error;
    }
  }

  /**
   * Import preferences from backup
   */
  async importPreferences(preferencesJson: string): Promise<boolean> {
    try {
      const preferences = JSON.parse(preferencesJson);
      // Validate the structure
      if (this.validatePreferences(preferences)) {
        return await this.saveUserPreferences(preferences);
      }
      return false;
    } catch (error) {
      console.error("Error importing preferences:", error);
      return false;
    }
  }

  /**
   * Validate preferences structure
   */
  private validatePreferences(
    preferences: any
  ): preferences is UserPreferences {
    // Basic validation - you can make this more comprehensive
    return (
      preferences &&
      typeof preferences === "object" &&
      Array.isArray(preferences.categories) &&
      typeof preferences.difficulty === "string" &&
      typeof preferences.maxTime === "number"
    );
  }
}

export const preferencesService = PreferencesService.getInstance();
