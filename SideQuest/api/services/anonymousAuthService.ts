import { ENDPOINTS } from "../config";
import { QuestPreferences } from "@/types/quest";
import { UserProfile } from "./authService";
import client from "../client";

export interface AnonymousSignInResponse {
  accessToken: string;
  user: UserProfile;
}

export interface CreateUserWithPreferencesRequest {
  device_uuid: string;
  preferences: QuestPreferences;
  notifications_enabled: boolean;
  notification_time: string;
  timezone: string;
}

export const anonymousAuthService = {
  /**
   * Sign in anonymously using device UUID
   */
  async signInAnonymously(
    deviceUuid: string
  ): Promise<AnonymousSignInResponse> {
    // The client now throws on error, so no try/catch is needed here.
    // The client also unwraps the { data: ... } wrapper for us.
    return client.post<AnonymousSignInResponse>(ENDPOINTS.ANONYMOUS_SIGNIN, {
      device_uuid: deviceUuid,
    });
  },

  /**
   * Create user with preferences (for new users completing onboarding)
   */
  async createUserWithPreferences(
    deviceUuid: string,
    preferences: QuestPreferences,
    notificationsEnabled: boolean,
    notificationTime: string,
    timezone: string
  ): Promise<AnonymousSignInResponse> {
    const request: CreateUserWithPreferencesRequest = {
      device_uuid: deviceUuid,
      preferences,
      notifications_enabled: notificationsEnabled,
      notification_time: notificationTime,
      timezone,
    };

    return client.post<AnonymousSignInResponse>(
      ENDPOINTS.CREATE_USER_WITH_PREFERENCES,
      request
    );
  },
};
