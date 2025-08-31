import { ENDPOINTS } from "@/api/config";
import { apiClient } from "@/api/client";

export interface AppleSignInCredential {
  identityToken: string;
  authorizationCode?: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
  email?: string;
  user?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    access_token: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      role?: string;
    };
  };
  error?: {
    message: string;
  };
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

class AuthService {
  /**
   * Authenticate user with Apple Sign-In
   */
  async signInWithApple(
    credential: AppleSignInCredential
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        ENDPOINTS.APPLE_SIGNIN,
        {
          appleIdToken: credential,
        }
      );

      if (!response.ok) {
        throw new Error(response.error?.message || "Authentication failed");
      }

      return response.data!;
    } catch (error) {
      console.error("Apple Sign-In error:", error);
      throw error;
    }
  }

  /**
   * Validate JWT token with backend
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // We can use any protected endpoint to validate the token
      const response = await apiClient.get("/sidequest/health");
      return response.ok;
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
      const response = await apiClient.post<{ access_token: string }>(
        ENDPOINTS.REFRESH_TOKEN
      );

      if (!response.ok) {
        throw new Error(response.error?.message || "Token refresh failed");
      }

      return response.data!.access_token;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
