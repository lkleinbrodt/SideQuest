import { ENDPOINTS } from "../config";
import client from "../client";

export interface QuestTemplate {
  id: number;
  text: string;
  category: string;
  difficulty: string;
  tags: string[];
  estimatedTime: string;
  ownerUserId: number | null;
  parentTemplateId: number | null;
  modelUsed: string | null;
  fallbackUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestTemplateVote {
  id: number;
  userId: number;
  questTemplateId: number;
  vote: "thumbs_up" | "thumbs_down";
  createdAt: string;
}

export interface VoteStats {
  questTemplateId: number;
  totalVotes: number;
  thumbsUp: number;
  thumbsDown: number;
  approvalRate: number;
}

class VotingService {
  async getQuestsToVoteOn(limit: number = 5): Promise<QuestTemplate[]> {
    const response = await client.get<{ questTemplates: QuestTemplate[] }>(
      ENDPOINTS.VOTING_QUESTS,
      { limit }
    );
    return response.questTemplates;
  }

  async submitVote(
    questTemplateId: number,
    vote: "thumbs_up" | "thumbs_down"
  ): Promise<QuestTemplateVote> {
    const response = await client.post<{ vote: QuestTemplateVote }>(
      ENDPOINTS.VOTING_VOTE,
      {
        quest_template_id: questTemplateId,
        vote,
      }
    );
    return response.vote;
  }

  async getMyVotes(limit: number = 50): Promise<QuestTemplateVote[]> {
    const response = await client.get<{ votes: QuestTemplateVote[] }>(
      ENDPOINTS.VOTING_MY_VOTES,
      {
        limit,
      }
    );
    return response.votes;
  }

  async getTemplateVoteStats(questTemplateId: number): Promise<VoteStats> {
    return client.get<VoteStats>(
      `${ENDPOINTS.VOTING_STATS}/${questTemplateId}`
    );
  }
}

export const votingService = new VotingService();
