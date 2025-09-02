import {
  QuestCategory,
  QuestDifficulty,
  QuestPreferences,
  UserProfile,
} from "@/types/quest";

import { ENDPOINTS } from "../config";
import client from "../client";

// Frontend preferences interface - simplified
export interface UserPreferences extends QuestPreferences {
  notifications: {
    enabled: boolean;
    time: string;
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

class PreferencesService {
  /**
   * Get user profile from backend
   */
  async getUserProfile(): Promise<UserProfile> {
    return client.get<UserProfile>(ENDPOINTS.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return client.put<UserProfile>(ENDPOINTS.PROFILE, updates);
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(): Promise<{
    message: string;
    onboarding_completed: boolean;
    user_id: number;
  }> {
    return client.post(ENDPOINTS.ONBOARDING_COMPLETE, {});
  }
}

export const preferencesService = new PreferencesService();
