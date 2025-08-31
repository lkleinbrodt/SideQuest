import { Quest } from "@/types/quest";

const FALLBACK_QUESTS: Omit<
  Quest,
  "id" | "createdAt" | "expiresAt" | "selected" | "completed" | "skipped"
>[] = [
  {
    text: "Take a 10-minute walk outside and notice 3 things you haven't seen before",
    category: "outdoors",
    estimatedTime: "10 min",
    difficulty: "easy",
    tags: ["nature", "mindfulness", "exercise"],
  },
  {
    text: "Text a friend you haven't talked to in a while with a fun question",
    category: "social",
    estimatedTime: "5 min",
    difficulty: "easy",
    tags: ["connection", "communication"],
  },
  {
    text: "Try a new recipe with ingredients you already have at home",
    category: "hobbies",
    estimatedTime: "15 min",
    difficulty: "medium",
    tags: ["cooking", "creativity", "learning"],
  },
  {
    text: "Do 10 minutes of stretching or yoga",
    category: "fitness",
    estimatedTime: "10 min",
    difficulty: "easy",
    tags: ["health", "wellness", "flexibility"],
  },
  {
    text: "Write down 3 things you're grateful for today",
    category: "mindfulness",
    estimatedTime: "5 min",
    difficulty: "easy",
    tags: ["gratitude", "reflection", "mental-health"],
  },
  {
    text: "Organize one small area of your living space",
    category: "chores",
    estimatedTime: "10 min",
    difficulty: "easy",
    tags: ["organization", "cleanliness"],
  },
  {
    text: "Learn to say 'hello' in a new language",
    category: "learning",
    estimatedTime: "5 min",
    difficulty: "easy",
    tags: ["education", "culture", "language"],
  },
  {
    text: "Draw or doodle something for 5 minutes",
    category: "creativity",
    estimatedTime: "5 min",
    difficulty: "easy",
    tags: ["art", "expression", "relaxation"],
  },
];

export { FALLBACK_QUESTS };
