import {
  Quest,
  QuestCompletionRequest,
  QuestGenerationRequest,
  QuestGenerationResponse,
  QuestHistory,
  QuestPreferences,
} from "@/types/quest";

import { ENDPOINTS } from "../config";
import { FALLBACK_QUESTS } from "@/utils/fallbackQuests";
import { apiClient } from "../client";

// Fallback quest pool for when API is unavailable

class QuestService {
  private static instance: QuestService;
  private fallbackQuests: Quest[] = [];

  private constructor() {
    this.initializeFallbackQuests();
  }

  public static getInstance(): QuestService {
    if (!QuestService.instance) {
      QuestService.instance = new QuestService();
    }
    return QuestService.instance;
  }

  private initializeFallbackQuests() {
    this.fallbackQuests = FALLBACK_QUESTS.map((quest) => ({
      ...quest,
      id: `fallback-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      selected: false,
      completed: false,
      skipped: false,
    }));
  }

  /**
   * Convert frontend preferences to backend format
   */
  private convertPreferencesToBackend(preferences: QuestPreferences) {
    return {
      categories: preferences.categories,
      difficulty: preferences.difficulty,
      max_time: preferences.maxTime,
      include_completed: preferences.includeCompleted,
      include_skipped: preferences.includeSkipped,
    };
  }

  /**
   * Generate daily quests based on user preferences
   */
  async generateDailyQuests(preferences: QuestPreferences): Promise<Quest[]> {
    try {
      const request: QuestGenerationRequest = {
        preferences: this.convertPreferencesToBackend(preferences),
        context: {
          timeOfDay: this.getTimeOfDay(),
          // Add more context as available
        },
      };

      const response = await apiClient.post<QuestGenerationResponse>(
        ENDPOINTS.GENERATE_DAILY,
        request
      );

      if (response.ok && response.data?.success && response.data.data?.quests) {
        return response.data.data.quests;
      }

      // Fallback to curated quests if API fails
      console.log("API failed, using fallback quests");
      return this.getFallbackQuests(preferences);
    } catch (error) {
      console.error("Error generating quests:", error);
      return this.getFallbackQuests(preferences);
    }
  }

  /**
   * Get fallback quests filtered by preferences
   */
  private getFallbackQuests(preferences: QuestPreferences): Quest[] {
    let availableQuests = [...this.fallbackQuests];

    // Filter by category preferences
    if (preferences.categories.length > 0) {
      availableQuests = availableQuests.filter((quest) =>
        preferences.categories.includes(quest.category)
      );
    }

    // Filter by difficulty
    if (preferences.difficulty !== "hard") {
      availableQuests = availableQuests.filter(
        (quest) =>
          quest.difficulty === preferences.difficulty ||
          quest.difficulty === "easy"
      );
    }

    // Filter by time
    if (preferences.maxTime > 0) {
      const maxMinutes = preferences.maxTime;
      availableQuests = availableQuests.filter((quest) => {
        const timeStr = quest.estimatedTime;
        const minutes = parseInt(timeStr.match(/\d+/)?.[0] || "15");
        return minutes <= maxMinutes;
      });
    }

    // Shuffle and return 3 quests
    return this.shuffleArray(availableQuests).slice(0, 3);
  }

  /**
   * Submit quest completion feedback
   */
  async submitQuestFeedback(request: QuestCompletionRequest): Promise<boolean> {
    try {
      const response = await apiClient.post(
        ENDPOINTS.COMPLETE_QUEST.replace(":id", request.questId),
        {
          feedback_rating: request.feedback.rating,
          feedback_comment: request.feedback.comment,
          time_spent: request.feedback.timeSpent,
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Error submitting quest feedback:", error);
      return false;
    }
  }

  /**
   * Select a quest
   */
  async selectQuest(questId: string): Promise<boolean> {
    try {
      const response = await apiClient.post(
        ENDPOINTS.SELECT_QUEST.replace(":id", questId)
      );
      return response.ok;
    } catch (error) {
      console.error("Error selecting quest:", error);
      return false;
    }
  }

  /**
   * Skip a quest
   */
  async skipQuest(questId: string): Promise<boolean> {
    try {
      const response = await apiClient.post(
        ENDPOINTS.SKIP_QUEST.replace(":id", questId)
      );
      return response.ok;
    } catch (error) {
      console.error("Error skipping quest:", error);
      return false;
    }
  }

  /**
   * Get quest history for a specific date
   */
  async getQuestHistory(date: Date): Promise<QuestHistory | null> {
    try {
      const dateStr = date.toISOString().split("T")[0];
      const response = await apiClient.get<QuestHistory>(
        `${ENDPOINTS.HISTORY}?date=${dateStr}`
      );

      if (response.ok && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error("Error fetching quest history:", error);
      return null;
    }
  }

  /**
   * Get user quest statistics
   */
  async getQuestStats(): Promise<{
    totalQuests: number;
    completedQuests: number;
    skippedQuests: number;
    completionRate: number;
    averageTimeSpent: number;
  }> {
    try {
      const response = await apiClient.get("/sidequest/stats");

      if (response.ok && response.data) {
        return response.data as {
          totalQuests: number;
          completedQuests: number;
          skippedQuests: number;
          completionRate: number;
          averageTimeSpent: number;
        };
      }

      // Return default stats if API fails
      return {
        totalQuests: 0,
        completedQuests: 0,
        skippedQuests: 0,
        completionRate: 0,
        averageTimeSpent: 0,
      };
    } catch (error) {
      console.error("Error fetching quest stats:", error);
      return {
        totalQuests: 0,
        completedQuests: 0,
        skippedQuests: 0,
        completionRate: 0,
        averageTimeSpent: 0,
      };
    }
  }

  /**
   * Get current time of day for context
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const questService = QuestService.getInstance();
