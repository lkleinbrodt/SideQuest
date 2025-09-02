import { ENDPOINTS } from "../config";
import { UserProfile } from "@/types/types";
import client from "../client";

class ProfileService {
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
   * Reset user profile
   */
  async resetUserProfile(): Promise<UserProfile> {
    return client.post<UserProfile>(ENDPOINTS.PROFILE_RESET, {});
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

export const profileService = new ProfileService();
