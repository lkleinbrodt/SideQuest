import { ENDPOINTS } from "@/api/config";
import { OnboardingProfile } from "@/types/types";
import client from "@/api/client";

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// Auth user info - minimal data from JWT token
export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

class AuthService {
  /**
   * Sign in anonymously using device UUID
   */
  async signInAnonymously(
    deviceUuid: string,
    profile: OnboardingProfile | null
  ): Promise<AuthResponse> {
    return client.post<AuthResponse>(ENDPOINTS.ANONYMOUS_SIGNIN, {
      device_uuid: deviceUuid,
      profile: profile ?? null,
    });
  }

  /**
   * Validate JWT token with backend
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // We can use any protected endpoint to validate the token
      await client.get("/sidequest/health");
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await client.post<{ accessToken: string }>(
        ENDPOINTS.REFRESH_TOKEN
      );
      return response.accessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
