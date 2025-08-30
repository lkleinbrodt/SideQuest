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
  completedAt?: Date;
  feedback?: QuestFeedback;
  createdAt: Date;
  expiresAt: Date;
}

export type QuestCategory = 
  | 'fitness' 
  | 'social' 
  | 'mindfulness' 
  | 'chores' 
  | 'hobbies' 
  | 'outdoors' 
  | 'learning' 
  | 'creativity';

export type QuestDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestFeedback {
  rating: 'thumbs_up' | 'thumbs_down' | null;
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

export interface QuestGenerationRequest {
  preferences: QuestPreferences;
  context?: {
    weather?: string;
    location?: string;
    timeOfDay?: string;
    mood?: string;
  };
}

export interface QuestGenerationResponse {
  quests: Quest[];
  metadata: {
    generatedAt: Date;
    model?: string;
    fallbackUsed: boolean;
  };
}

export interface QuestCompletionRequest {
  questId: string;
  feedback: QuestFeedback;
}

export interface QuestHistory {
  date: Date;
  quests: Quest[];
  stats: {
    selected: number;
    completed: number;
    skipped: number;
    totalTime: number;
  };
}
