import { ENDPOINTS } from "@/api/config";
import client from "@/api/client";

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
  accessToken: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
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
    // The client now throws on error, so no try/catch is needed here.
    return client.post<AuthResponse>(ENDPOINTS.APPLE_SIGNIN, {
      appleIdToken: credential,
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
