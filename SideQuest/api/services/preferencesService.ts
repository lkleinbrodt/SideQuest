import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestPreferences, QuestCategory, QuestDifficulty } from '@/types/quest';

const PREFERENCES_STORAGE_KEY = '@sidequest:user_preferences';
const ONBOARDING_COMPLETE_KEY = '@sidequest:onboarding_complete';

export interface UserPreferences extends QuestPreferences {
  notifications: {
    enabled: boolean;
    time: string; // HH:MM format
    sound: boolean;
    vibration: boolean;
  };
  theme: 'light' | 'dark' | 'system';
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
      categories: ['fitness', 'social', 'mindfulness', 'hobbies', 'outdoors'],
      difficulty: 'easy',
      maxTime: 15,
      includeCompleted: true,
      includeSkipped: false,
      notifications: {
        enabled: true,
        time: '07:00',
        sound: true,
        vibration: true,
      },
      theme: 'system',
      language: 'en',
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
   * Get user preferences from storage
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...this.defaultPreferences, ...parsed };
      }
      return this.defaultPreferences;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return this.defaultPreferences;
    }
  }

  /**
   * Save user preferences to storage
   */
  async saveUserPreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const current = await this.getUserPreferences();
      const updated = { ...current, ...preferences };
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
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
      await AsyncStorage.removeItem(PREFERENCES_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return false;
    }
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return stored === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      return true;
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      return false;
    }
  }

  /**
   * Get quest preferences specifically
   */
  async getQuestPreferences(): Promise<QuestPreferences> {
    const preferences = await this.getUserPreferences();
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
  async updateQuestPreferences(updates: Partial<QuestPreferences>): Promise<boolean> {
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
  async updateNotificationPreferences(updates: Partial<UserPreferences['notifications']>): Promise<boolean> {
    const current = await this.getUserPreferences();
    const updatedNotifications = { ...current.notifications, ...updates };
    return this.saveUserPreferences({ notifications: updatedNotifications });
  }

  /**
   * Get theme preference
   */
  async getThemePreference(): Promise<'light' | 'dark' | 'system'> {
    const preferences = await this.getUserPreferences();
    return preferences.theme;
  }

  /**
   * Update theme preference
   */
  async updateThemePreference(theme: 'light' | 'dark' | 'system'): Promise<boolean> {
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
  async updateAccessibilityPreferences(updates: Partial<UserPreferences['accessibility']>): Promise<boolean> {
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
      console.error('Error exporting preferences:', error);
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
      console.error('Error importing preferences:', error);
      return false;
    }
  }

  /**
   * Validate preferences structure
   */
  private validatePreferences(preferences: any): preferences is UserPreferences {
    // Basic validation - you can make this more comprehensive
    return (
      preferences &&
      typeof preferences === 'object' &&
      Array.isArray(preferences.categories) &&
      typeof preferences.difficulty === 'string' &&
      typeof preferences.maxTime === 'number'
    );
  }
}

export const preferencesService = PreferencesService.getInstance();
