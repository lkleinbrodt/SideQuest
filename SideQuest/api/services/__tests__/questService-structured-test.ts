import { QuestPreferences } from "@/types/quest";
import { questService } from "../questService";

// Mock the API client
jest.mock("../client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock the fallback quests
jest.mock("@/utils/fallbackQuests", () => ({
  FALLBACK_QUESTS: [
    {
      id: "fallback-1",
      text: "Test quest 1",
      category: "fitness",
      estimatedTime: "5 minutes",
      difficulty: "easy",
      tags: ["test"],
      selected: false,
      completed: false,
      skipped: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  ],
}));

describe("QuestService - Structured Quest Generation", () => {
  const mockPreferences: QuestPreferences = {
    categories: ["fitness"],
    difficulty: "easy",
    maxTime: 15,
    includeCompleted: true,
    includeSkipped: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    delete process.env.NODE_ENV;
  });

  describe("getAvailableQuests", () => {
    it("should return existing available quests when they exist", async () => {
      const mockResponse = {
        ok: true,
        data: {
          success: true,
          data: {
            quests: [
              {
                id: "1",
                text: "Existing quest",
                category: "fitness",
                estimatedTime: "5 minutes",
                difficulty: "easy",
                tags: ["test"],
                selected: false,
                completed: false,
                skipped: false,
                createdAt: "2024-01-01T00:00:00Z",
                expiresAt: "2024-01-02T00:00:00Z",
              },
            ],
          },
        },
      };

      const { apiClient } = require("../client");
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await questService.getAvailableQuests(mockPreferences);

      expect(apiClient.get).toHaveBeenCalledWith("/sidequest/quests/available");
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Existing quest");
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].expiresAt).toBeInstanceOf(Date);
    });

    it("should fall back to generating new quests when no existing quests", async () => {
      const mockResponse = {
        ok: true,
        data: {
          success: true,
          data: {
            quests: [],
          },
        },
      };

      const { apiClient } = require("../client");
      apiClient.get.mockResolvedValue(mockResponse);
      apiClient.post.mockResolvedValue({
        ok: true,
        data: {
          success: true,
          data: {
            quests: [
              {
                id: "2",
                text: "New quest",
                category: "fitness",
                estimatedTime: "5 minutes",
                difficulty: "easy",
                tags: ["test"],
                selected: false,
                completed: false,
                skipped: false,
                createdAt: "2024-01-01T00:00:00Z",
                expiresAt: "2024-01-02T00:00:00Z",
              },
            ],
          },
        },
      });

      const result = await questService.getAvailableQuests(mockPreferences);

      expect(apiClient.get).toHaveBeenCalledWith("/sidequest/quests/available");
      expect(apiClient.post).toHaveBeenCalledWith(
        "/sidequest/generate",
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("New quest");
    });

    it("should use fallback quests in development mode", async () => {
      process.env.NODE_ENV = "development";

      const result = await questService.getAvailableQuests(mockPreferences);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Test quest 1");
    });

    it("should handle API errors gracefully", async () => {
      const { apiClient } = require("../client");
      apiClient.get.mockRejectedValue(new Error("API Error"));
      apiClient.post.mockResolvedValue({
        ok: true,
        data: {
          success: true,
          data: {
            quests: [
              {
                id: "3",
                text: "Fallback quest",
                category: "fitness",
                estimatedTime: "5 minutes",
                difficulty: "easy",
                tags: ["test"],
                selected: false,
                completed: false,
                skipped: false,
                createdAt: "2024-01-01T00:00:00Z",
                expiresAt: "2024-01-02T00:00:00Z",
              },
            ],
          },
        },
      });

      const result = await questService.getAvailableQuests(mockPreferences);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Fallback quest");
    });

    it("should refresh quests and get new ones", async () => {
      const mockResponse = {
        ok: true,
        data: {
          success: true,
          data: {
            quests: [
              {
                id: "4",
                text: "Refreshed quest",
                category: "fitness",
                estimatedTime: "5 minutes",
                difficulty: "easy",
                tags: ["test"],
                selected: false,
                completed: false,
                skipped: false,
                createdAt: "2024-01-01T00:00:00Z",
                expiresAt: "2024-01-02T00:00:00Z",
              },
            ],
            metadata: {
              oldQuestsSkipped: 2,
            },
          },
        },
      };

      const { apiClient } = require("../client");
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await questService.refreshQuests(mockPreferences);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/sidequest/quests/refresh",
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Refreshed quest");
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].expiresAt).toBeInstanceOf(Date);
    });

    it("should use fallback quests in development mode for refresh", async () => {
      process.env.NODE_ENV = "development";

      const result = await questService.refreshQuests(mockPreferences);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Test quest 1");
    });
  });
});
