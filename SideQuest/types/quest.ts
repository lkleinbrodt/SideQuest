export interface Quest {
  id: string;
  text: string;
  category: QuestCategory;
  estimatedTime: string;
  difficulty: QuestDifficulty;
  tags: string[];
  status: QuestStatus;
  completedAt?: Date; // Convert from ISO string to Date
  feedback?: QuestFeedback;
  createdAt: Date; // Convert from ISO string to Date
  expiresAt: Date; // Convert from ISO string to Date
}

export interface QuestBoard {
  id: number;
  userId: number;
  lastRefreshed: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quests: Quest[];
}

export type QuestStatus =
  | "potential"
  | "accepted"
  | "completed"
  | "failed"
  | "abandoned"
  | "declined";

export type QuestCategory =
  | "fitness"
  | "social"
  | "mindfulness"
  | "chores"
  | "hobbies"
  | "outdoors"
  | "learning"
  | "creativity";

export type QuestDifficulty = "easy" | "medium" | "hard";

export interface QuestFeedback {
  rating: "thumbs_up" | "thumbs_down" | null;
  comment?: string;
  completed: boolean;
  timeSpent?: number; // in minutes
}

export interface QuestPreferences {
  categories: QuestCategory[];
  difficulty: QuestDifficulty;
  maxTime: number; // in minutes
  includeCompleted: boolean;
  includeSkipped: boolean;
}

// Backend request format
export interface QuestGenerationRequest {
  preferences: {
    categories: QuestCategory[];
    difficulty: QuestDifficulty;
    max_time: number; // Backend uses snake_case
    include_completed: boolean;
    include_skipped: boolean;
  };
  context?: {
    weather?: string;
    location?: string;
    timeOfDay?: string;
    mood?: string;
  };
}

// Backend response format
export interface QuestGenerationResponse {
  success: boolean;
  data?: {
    quests: Quest[];
    metadata: {
      generatedAt: string;
      count: number;
      user_id: number;
    };
  };
  error?: {
    message: string;
  };
}

export interface QuestCompletionRequest {
  questId: string;
  feedback: QuestFeedback;
}

// Backend user preferences format
export interface UserProfile {
  id: number;
  userId: number;
  categories: QuestCategory[];
  difficulty: QuestDifficulty;
  maxTime: number;
  includeCompleted: boolean;
  includeSkipped: boolean;
  notificationsEnabled: boolean;
  notificationTime: string;
  timezone: string;
  onboardingCompleted: boolean;
  lastQuestGeneration?: string;
  createdAt: string;
  updatedAt: string;
}
