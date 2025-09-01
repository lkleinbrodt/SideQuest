const API_CONFIG = {
  development: {
    baseURL: "http://localhost:5002/api",
    timeout: 30000,
  },
  production: {
    baseURL: "https://api.landonkleinbrodt.com/api",
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
  // Quest board management
  QUEST_BOARD: "/sidequest/quests/board",
  QUEST_BOARD_NEEDS_REFRESH: "/sidequest/quests/needs-refresh",
  QUEST_BOARD_REFRESH: "/sidequest/quests/refresh",

  // Quest status updates (consolidated)
  QUEST_STATUS_UPDATE: "/sidequest/quests", // Will be used as base for /:id/status

  // User preferences
  PROFILE: "/sidequest/me",
  ONBOARDING_COMPLETE: "/sidequest/onboarding/complete",

  // Health check
  HEALTH: "/sidequest/health",

  // Authentication
  APPLE_SIGNIN: "/sidequest/auth/apple/signin",
  ANONYMOUS_SIGNIN: "/sidequest/auth/anonymous/signin",
  CREATE_USER_WITH_PREFERENCES:
    "/sidequest/auth/anonymous/create-with-preferences",
  REFRESH_TOKEN: "/auth/refresh",
} as const;
