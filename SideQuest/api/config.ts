const API_CONFIG = {
  development: {
    baseURL: "http://localhost:5002/api",
    timeout: 30000,
  },
  staging: {
    baseURL: "https://staging-api.coyote-ai.com/api",
    timeout: 30000,
  },
  production: {
    baseURL: "https://api.coyote-ai.com/api",
    timeout: 30000,
  },
};

export const getApiConfig = () => {
  return (
    API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] ||
    API_CONFIG.development
  );
};

// SideQuest specific endpoints - updated to match backend routes
export const ENDPOINTS = {
  // Quest management
  GENERATE_DAILY: "/sidequest/generate",
  QUESTS: "/sidequest/quests",
  SELECT_QUEST: "/sidequest/quests/:id/select",
  COMPLETE_QUEST: "/sidequest/quests/:id/complete",
  SKIP_QUEST: "/sidequest/quests/:id/skip",

  // User preferences
  PREFERENCES: "/sidequest/preferences",
  ONBOARDING_COMPLETE: "/sidequest/onboarding/complete",

  // Quest history
  HISTORY: "/sidequest/history",

  // Health check
  HEALTH: "/sidequest/health",

  // Authentication
  APPLE_SIGNIN: "/sidequest/auth/apple/signin",
  REFRESH_TOKEN: "/auth/refresh",
} as const;
