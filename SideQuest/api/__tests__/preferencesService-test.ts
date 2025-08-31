import { QuestPreferences } from "@/types/quest";
import { preferencesService } from "../services/preferencesService";

// Mock the API client
jest.mock("../client", () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("PreferencesService", () => {
  const mockPreferences: QuestPreferences = {
    categories: ["fitness", "social"],
    difficulty: "easy",
    maxTime: 15,
    includeCompleted: true,
    includeSkipped: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserPreferences", () => {
    it("should fetch preferences from backend and merge with local", async () => {
      const mockBackendResponse = {
        ok: true,
        data: {
          success: true,
          data: {
            id: 1,
            user_id: 1,
            categories: ["fitness", "social"],
            difficulty: "easy",
            max_time: 15,
            include_completed: true,
            include_skipped: false,
            notifications_enabled: true,
            notification_time: "07:00",
            timezone: "UTC",
            onboarding_completed: true,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
      };

      const { apiClient } = require("../client");
      apiClient.get.mockResolvedValue(mockBackendResponse);

      const AsyncStorage = require("@react-native-async-storage/async-storage");
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          theme: "dark",
          language: "en",
        })
      );

      const result = await preferencesService.getUserPreferences();

      expect(apiClient.get).toHaveBeenCalledWith("/sidequest/preferences");
      expect(result.categories).toEqual(["fitness", "social"]);
      expect(result.difficulty).toBe("easy");
      expect(result.maxTime).toBe(15);
      expect(result.theme).toBe("dark");
      expect(result.language).toBe("en");
    });

    it("should fallback to local storage when backend fails", async () => {
      const { apiClient } = require("../client");
      apiClient.get.mockRejectedValue(new Error("Backend Error"));

      const AsyncStorage = require("@react-native-async-storage/async-storage");
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPreferences));

      const result = await preferencesService.getUserPreferences();

      expect(result.categories).toEqual(["fitness", "social"]);
      expect(result.difficulty).toBe("easy");
    });
  });

  describe("saveUserPreferences", () => {
    it("should save quest preferences to backend and local storage", async () => {
      const { apiClient } = require("../client");
      apiClient.put.mockResolvedValue({ ok: true });

      const AsyncStorage = require("@react-native-async-storage/async-storage");
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPreferences));

      const result = await preferencesService.saveUserPreferences({
        categories: ["mindfulness", "learning"],
        difficulty: "medium",
      });

      expect(apiClient.put).toHaveBeenCalledWith("/sidequest/preferences", {
        categories: ["mindfulness", "learning"],
        difficulty: "medium",
        max_time: 15,
        include_completed: true,
        include_skipped: false,
      });

      expect(result).toBe(true);
    });

    it("should fallback to local storage when backend fails", async () => {
      const { apiClient } = require("../client");
      apiClient.put.mockRejectedValue(new Error("Backend Error"));

      const AsyncStorage = require("@react-native-async-storage/async-storage");
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPreferences));

      const result = await preferencesService.saveUserPreferences({
        categories: ["mindfulness"],
      });

      expect(result).toBe(true);
    });
  });

  describe("isOnboardingComplete", () => {
    it("should check backend first, then fallback to local", async () => {
      const { apiClient } = require("../client");
      apiClient.get.mockResolvedValue({
        ok: true,
        data: {
          success: true,
          data: {
            onboarding_completed: true,
          },
        },
      });

      const result = await preferencesService.isOnboardingComplete();

      expect(result).toBe(true);
      expect(apiClient.get).toHaveBeenCalledWith("/sidequest/preferences");
    });
  });

  describe("completeOnboarding", () => {
    it("should mark onboarding complete on both backend and local", async () => {
      const { apiClient } = require("../client");
      apiClient.post.mockResolvedValue({ ok: true });

      const AsyncStorage = require("@react-native-async-storage/async-storage");

      const result = await preferencesService.completeOnboarding();

      expect(apiClient.post).toHaveBeenCalledWith(
        "/sidequest/onboarding/complete",
        {}
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@sidequest:onboarding_complete",
        "true"
      );
      expect(result).toBe(true);
    });
  });
});
