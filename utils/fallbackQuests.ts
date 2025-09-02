import { Quest, QuestCategory, QuestDifficulty } from "@/types/types";

// Fallback quests for when the API is unavailable
export const fallbackQuests: Omit<Quest, "id" | "createdAt" | "expiresAt">[] = [
  {
    text: "Take a 10-minute walk outside without your phone",
    category: "outdoors" as QuestCategory,
    estimatedTime: "10 min",
    difficulty: "easy" as QuestDifficulty,
    tags: ["nature", "mindfulness", "exercise"],
    status: "potential",
  },
  {
    text: "Text a friend you haven't talked to in a while",
    category: "social" as QuestCategory,
    estimatedTime: "5 min",
    difficulty: "easy" as QuestDifficulty,
    tags: ["connection", "communication"],
    status: "potential",
  },
  {
    text: "Make a salsa",
    category: "hobbies" as QuestCategory,
    estimatedTime: "30 min",
    difficulty: "hard" as QuestDifficulty,
    tags: ["cooking", "creativity", "learning"],
    status: "potential",
  },
  {
    text: "Do 10 minutes of stretching or yoga",
    category: "fitness" as QuestCategory,
    estimatedTime: "10 min",
    difficulty: "easy" as QuestDifficulty,
    tags: ["health", "wellness", "flexibility"],
    status: "potential",
  },
  {
    text: "Write down 3 things you're grateful for today",
    category: "mindfulness" as QuestCategory,
    estimatedTime: "5 min",
    difficulty: "easy" as QuestDifficulty,
    tags: ["gratitude", "reflection", "mental-health"],
    status: "potential",
  },
  {
    text: "Organize one small area of your living space",
    category: "chores" as QuestCategory,
    estimatedTime: "15 min",
    difficulty: "easy" as QuestDifficulty,
    tags: ["organization", "cleanliness"],
    status: "potential",
  },
  {
    text: "Learn to say 'hello' in a new language",
    category: "learning" as QuestCategory,
    estimatedTime: "10 min",
    difficulty: "easy" as QuestDifficulty,
    tags: ["education", "culture", "language"],
    status: "potential",
  },
  {
    text: "Draw for 5 minutes",
    category: "creativity" as QuestCategory,
    estimatedTime: "5 min",
    difficulty: "easy" as QuestDifficulty,
    tags: ["art", "expression", "relaxation"],
    status: "potential",
  },
];

// Helper function to convert fallback quests to full Quest objects
export const createFallbackQuest = (
  quest: Omit<Quest, "id" | "createdAt" | "expiresAt">
): Quest => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  return {
    ...quest,
    id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    expiresAt,
  };
};
