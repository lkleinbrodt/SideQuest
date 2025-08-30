import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { create } from "apisauce";
import { getApiConfig } from "./config";
import { getToken } from "@/auth/storage";

// Types
export interface APIResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

class APIClient {
  private static instance: APIClient;
  private api;
  private baseURL: string;

  private constructor() {
    const config = getApiConfig();
    this.baseURL = config.baseURL;

    this.api = create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private getUserAgent(): string {
    const appVersion = Constants.expoConfig?.version || "1.0.0";
    return `SideQuest/${appVersion} (${Platform.OS}; ${Platform.Version})`;
  }

  private async setupInterceptors() {
    // Request interceptor for authentication and connectivity
    this.api.addRequestTransform(async (request) => {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        throw new Error("No internet connection");
      }

      const token = await getToken();
      if (token && request.headers) {
        request.headers["Authorization"] = `Bearer ${token}`;
      }
    });
  }

  // HTTP methods with proper typing and error handling
  async get<T>(path: string): Promise<APIResponse<T>> {
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
      });

      const token = await getToken();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`${this.baseURL}${path}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  async post<T>(path: string, body?: any): Promise<APIResponse<T>> {
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
      });

      const token = await getToken();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      if (body instanceof FormData) {
        headers.delete("Content-Type");
      }

      const response = await fetch(`${this.baseURL}${path}`, {
        method: "POST",
        headers,
        body:
          body instanceof FormData
            ? body
            : body
            ? JSON.stringify(body)
            : undefined,
      });

      const data = await response.json();

      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  // Add PUT, DELETE, etc. methods as needed
  async put<T>(path: string, body?: any): Promise<APIResponse<T>> {
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
      });

      const token = await getToken();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`${this.baseURL}${path}`, {
        method: "PUT",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  async delete<T>(path: string): Promise<APIResponse<T>> {
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
      });

      const token = await getToken();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`${this.baseURL}${path}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }
}

export const apiClient = APIClient.getInstance();
