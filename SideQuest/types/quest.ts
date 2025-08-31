export interface Quest {
  id: string;
  text: string;
  category: QuestCategory;
  estimatedTime: string;
  difficulty: QuestDifficulty;
  tags: string[];
  selected: boolean;
  completed: boolean;
  skipped: boolean;
  completedAt?: Date; // Convert from ISO string to Date
  feedback?: QuestFeedback;
  createdAt: Date; // Convert from ISO string to Date
  expiresAt: Date; // Convert from ISO string to Date
}

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

export interface QuestHistory {
  date: Date; // Convert from ISO string to Date
  quests: Quest[];
  stats: {
    selected: number;
    completed: number;
    skipped: number;
    totalTime: number;
  };
}

// Backend user preferences format
export interface BackendUserPreferences {
  id: number;
  user_id: number;
  categories: QuestCategory[];
  difficulty: QuestDifficulty;
  max_time: number;
  include_completed: boolean;
  include_skipped: boolean;
  notifications_enabled: boolean;
  notification_time: string;
  timezone: string;
  onboarding_completed: boolean;
  last_quest_generation?: string;
  created_at: string;
  updated_at: string;
}
