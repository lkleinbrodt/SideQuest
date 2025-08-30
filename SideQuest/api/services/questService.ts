import { apiClient } from '../client';
import { 
  Quest, 
  QuestPreferences, 
  QuestGenerationRequest, 
  QuestGenerationResponse,
  QuestCompletionRequest,
  QuestHistory,
  QuestCategory,
  QuestDifficulty
} from '@/types/quest';

// Fallback quest pool for when API is unavailable
const FALLBACK_QUESTS: Omit<Quest, 'id' | 'createdAt' | 'expiresAt' | 'selected' | 'completed' | 'skipped'>[] = [
  {
    text: "Take a 10-minute walk outside and notice 3 things you haven't seen before",
    category: 'outdoors',
    estimatedTime: "10 min",
    difficulty: 'easy',
    tags: ['nature', 'mindfulness', 'exercise'],
  },
  {
    text: "Text a friend you haven't talked to in a while with a fun question",
    category: 'social',
    estimatedTime: "5 min",
    difficulty: 'easy',
    tags: ['connection', 'communication'],
  },
  {
    text: "Try a new recipe with ingredients you already have at home",
    category: 'hobbies',
    estimatedTime: "15 min",
    difficulty: 'medium',
    tags: ['cooking', 'creativity', 'learning'],
  },
  {
    text: "Do 10 minutes of stretching or yoga",
    category: 'fitness',
    estimatedTime: "10 min",
    difficulty: 'easy',
    tags: ['health', 'wellness', 'flexibility'],
  },
  {
    text: "Write down 3 things you're grateful for today",
    category: 'mindfulness',
    estimatedTime: "5 min",
    difficulty: 'easy',
    tags: ['gratitude', 'reflection', 'mental-health'],
  },
  {
    text: "Organize one small area of your living space",
    category: 'chores',
    estimatedTime: "10 min",
    difficulty: 'easy',
    tags: ['organization', 'cleanliness'],
  },
  {
    text: "Learn to say 'hello' in a new language",
    category: 'learning',
    estimatedTime: "5 min",
    difficulty: 'easy',
    tags: ['education', 'culture', 'language'],
  },
  {
    text: "Draw or doodle something for 5 minutes",
    category: 'creativity',
    estimatedTime: "5 min",
    difficulty: 'easy',
    tags: ['art', 'expression', 'relaxation'],
  },
];

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
    this.fallbackQuests = FALLBACK_QUESTS.map(quest => ({
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
   * Generate daily quests based on user preferences
   */
  async generateDailyQuests(preferences: QuestPreferences): Promise<Quest[]> {
    try {
      const request: QuestGenerationRequest = {
        preferences,
        context: {
          timeOfDay: this.getTimeOfDay(),
          // Add more context as available
        },
      };

      const response = await apiClient.post<QuestGenerationResponse>('/sidequest/generate', request);
      
      if (response.ok && response.data) {
        return response.data.quests;
      }

      // Fallback to curated quests if API fails
      console.log('API failed, using fallback quests');
      return this.getFallbackQuests(preferences);
    } catch (error) {
      console.error('Error generating quests:', error);
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
      availableQuests = availableQuests.filter(quest => 
        preferences.categories.includes(quest.category)
      );
    }

    // Filter by difficulty
    if (preferences.difficulty !== 'hard') {
      availableQuests = availableQuests.filter(quest => 
        quest.difficulty === preferences.difficulty || quest.difficulty === 'easy'
      );
    }

    // Filter by time
    if (preferences.maxTime > 0) {
      const maxMinutes = preferences.maxTime;
      availableQuests = availableQuests.filter(quest => {
        const timeStr = quest.estimatedTime;
        const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '15');
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
      const response = await apiClient.post('/sidequest/complete', request);
      return response.ok;
    } catch (error) {
      console.error('Error submitting quest feedback:', error);
      return false;
    }
  }

  /**
   * Get quest history for a specific date
   */
  async getQuestHistory(date: Date): Promise<QuestHistory | null> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await apiClient.get<QuestHistory>(`/sidequest/history/${dateStr}`);
      
      if (response.ok && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching quest history:', error);
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
      const response = await apiClient.get('/sidequest/stats');
      
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
      console.error('Error fetching quest stats:', error);
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
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
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
