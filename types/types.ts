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

// Unified user profile - used for both auth and profile management
export interface UserProfile {
  id: string; // From auth response (string)
  categories: QuestCategory[];
  difficulty: QuestDifficulty;
  maxTime: number;
  additionalNotes?: string;
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

// For onboarding - same as UserProfile but without id (which gets set after auth)
export type OnboardingProfile = Omit<UserProfile, "id">;
