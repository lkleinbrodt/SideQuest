import { Quest, QuestBoard, QuestStatus } from "@/types/types";

import { ENDPOINTS } from "../config";
import client from "../client";

class QuestService {
  async getQuestBoard(): Promise<QuestBoard> {
    // The client now throws on error, so no try/catch is needed here.
    // The client also unwraps the { data: ... } wrapper for us.
    // This endpoint gets the user's current quest board,
    //if it needs a refresh, it will refresh it first
    // if it needs to be topped up with potential quests, it will do that
    return client.post<QuestBoard>(ENDPOINTS.QUEST_BOARD);
  }

  async refreshQuestBoard(): Promise<QuestBoard> {
    return client.post<QuestBoard>(ENDPOINTS.QUEST_BOARD_REFRESH);
  }

  // Single, consolidated method for all status updates
  async updateQuestStatus(
    questId: string,
    status: QuestStatus,
    feedback?: any
  ): Promise<Quest> {
    const payload = { status, feedback };
    // Note the new dynamic URL from the consolidated backend route
    const endpoint = `${ENDPOINTS.QUEST_STATUS_UPDATE}/${questId}/status`;
    return client.put<Quest>(endpoint, payload);
  }

  // Check if board needs refresh
  async checkBoardNeedsRefresh(): Promise<{ needsRefresh: boolean }> {
    return client.get<{ needsRefresh: boolean }>(
      ENDPOINTS.QUEST_BOARD_NEEDS_REFRESH
    );
  }

  // Get quest history
  async getQuestHistory(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
  }): Promise<{
    quests: Quest[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }> {
    return client.get("/sidequest/quests/history", params);
  }

  // Get history statistics (streak, success rate, etc.)
  async getHistoryStats(): Promise<{
    streak: number;
    successRate: number;
    mostCompletedCategory: string | null;
    topTags: Array<{ tag: string; count: number }>;
    totalCompleted: number;
    totalAccepted: number;
  }> {
    return client.get("/sidequest/history/stats");
  }

  // Get 7-day history
  async get7DayHistory(): Promise<{
    history: Array<{
      date: string;
      quests: Array<{
        id: string;
        text: string;
        category: string | null;
        completed: boolean;
        skipped: boolean;
      }>;
      completedCount: number;
      totalCount: number;
    }>;
  }> {
    return client.get("/sidequest/history/7day");
  }
}

export const questService = new QuestService();
