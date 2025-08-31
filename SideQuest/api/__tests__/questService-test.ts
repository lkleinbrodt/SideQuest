import { QuestPreferences } from "@/types/quest";
import { questService } from "../services/questService";

// Mock the API client
jest.mock("../client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe("QuestService", () => {
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

  describe("generateDailyQuests", () => {
    it("should convert preferences to backend format correctly", async () => {
      const mockApiResponse = {
        ok: true,
        data: {
          success: true,
          data: {
            quests: [
              {
                id: "1",
                text: "Test quest",
                category: "fitness",
                estimatedTime: "10 min",
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
              generatedAt: "2024-01-01T00:00:00Z",
              count: 1,
              user_id: 1,
            },
          },
        },
      };

      const { apiClient } = require("../client");
      apiClient.post.mockResolvedValue(mockApiResponse);

      const result = await questService.generateDailyQuests(mockPreferences);

      expect(apiClient.post).toHaveBeenCalledWith("/sidequest/generate", {
        preferences: {
          categories: ["fitness", "social"],
          difficulty: "easy",
          max_time: 15,
          include_completed: true,
          include_skipped: false,
        },
        context: {
          timeOfDay: expect.any(String),
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Test quest");
    });

    it("should fallback to curated quests when API fails", async () => {
      const { apiClient } = require("../client");
      apiClient.post.mockRejectedValue(new Error("API Error"));

      const result = await questService.generateDailyQuests(mockPreferences);

      // The fallback system filters quests by preferences, so we might get fewer than 3
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("text");
      expect(result[0]).toHaveProperty("category");
    });
  });

  describe("submitQuestFeedback", () => {
    it("should convert feedback to backend format correctly", async () => {
      const mockApiResponse = { ok: true };
      const { apiClient } = require("../client");
      apiClient.post.mockResolvedValue(mockApiResponse);

      const result = await questService.submitQuestFeedback({
        questId: "1",
        feedback: {
          rating: "thumbs_up",
          comment: "Great quest!",
          completed: true,
          timeSpent: 10,
        },
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/sidequest/quests/1/complete",
        {
          feedback_rating: "thumbs_up",
          feedback_comment: "Great quest!",
          time_spent: 10,
        }
      );

      expect(result).toBe(true);
    });
  });

  describe("selectQuest", () => {
    it("should call the correct endpoint", async () => {
      const mockApiResponse = { ok: true };
      const { apiClient } = require("../client");
      apiClient.post.mockResolvedValue(mockApiResponse);

      const result = await questService.selectQuest("1");

      expect(apiClient.post).toHaveBeenCalledWith("/sidequest/quests/1/select");
      expect(result).toBe(true);
    });
  });

  describe("skipQuest", () => {
    it("should call the correct endpoint", async () => {
      const mockApiResponse = { ok: true };
      const { apiClient } = require("../client");
      apiClient.post.mockResolvedValue(mockApiResponse);

      const result = await questService.skipQuest("1");

      expect(apiClient.post).toHaveBeenCalledWith("/sidequest/quests/1/skip");
      expect(result).toBe(true);
    });
  });
});
