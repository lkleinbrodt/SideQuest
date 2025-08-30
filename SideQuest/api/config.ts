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

// SideQuest specific endpoints
export const ENDPOINTS = {
  // Quest management
  GENERATE_DAILY: "/sidequest/generate_daily",
  TODAY: "/sidequest/today",
  FEEDBACK: "/sidequest/feedback",
  SELECT: "/sidequest/select",
  COMPLETE: "/sidequest/complete",

  // User preferences
  PREFERENCES: "/sidequest/preferences",
  ONBOARDING: "/sidequest/onboarding",

  // Authentication
  AUTH: "/sidequest/auth",
  REFRESH: "/sidequest/refresh",
} as const;
