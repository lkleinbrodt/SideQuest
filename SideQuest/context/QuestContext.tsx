import { Quest, QuestFeedback, QuestPreferences } from "@/types/quest";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

import { preferencesService } from "@/api/services/preferencesService";
import { questService } from "@/api/services/questService";

// State interface
interface QuestState {
  todayQuests: Quest[];
  selectedQuests: Quest[];
  completedQuests: Quest[];
  skippedQuests: Quest[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null; // Changed back to Date object
  preferences: QuestPreferences | null;
}

// Action types
type QuestAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TODAY_QUESTS"; payload: Quest[] }
  | { type: "SELECT_QUEST"; payload: string }
  | { type: "DESELECT_QUEST"; payload: string }
  | {
      type: "COMPLETE_QUEST";
      payload: { questId: string; feedback: QuestFeedback };
    }
  | {
      type: "SKIP_QUEST";
      payload: { questId: string; feedback: QuestFeedback };
    }
  | { type: "SET_PREFERENCES"; payload: QuestPreferences }
  | { type: "UPDATE_PREFERENCES"; payload: Partial<QuestPreferences> }
  | { type: "RESET_QUESTS" }
  | { type: "SET_LAST_UPDATED"; payload: string }; // Changed to string

// Initial state
const initialState: QuestState = {
  todayQuests: [],
  selectedQuests: [],
  completedQuests: [],
  skippedQuests: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  preferences: null,
};

// Reducer function
function questReducer(state: QuestState, action: QuestAction): QuestState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_TODAY_QUESTS":
      return {
        ...state,
        todayQuests: action.payload,
        selectedQuests: action.payload.filter((q) => q.selected),
        completedQuests: action.payload.filter((q) => q.completed),
        skippedQuests: action.payload.filter((q) => q.skipped),
      };

    case "SELECT_QUEST":
      return {
        ...state,
        todayQuests: state.todayQuests.map((q) =>
          q.id === action.payload ? { ...q, selected: true } : q
        ),
        selectedQuests: [
          ...state.selectedQuests,
          state.todayQuests.find((q) => q.id === action.payload)!,
        ],
      };

    case "DESELECT_QUEST":
      return {
        ...state,
        todayQuests: state.todayQuests.map((q) =>
          q.id === action.payload ? { ...q, selected: false } : q
        ),
        selectedQuests: state.selectedQuests.filter(
          (q) => q.id !== action.payload
        ),
      };

    case "COMPLETE_QUEST":
      return {
        ...state,
        todayQuests: state.todayQuests.map((q) =>
          q.id === action.payload.questId
            ? {
                ...q,
                completed: true,
                completedAt: new Date().toISOString(),
                feedback: action.payload.feedback,
              }
            : q
        ),
        selectedQuests: state.selectedQuests.filter(
          (q) => q.id !== action.payload.questId
        ),
        completedQuests: [
          ...state.completedQuests,
          state.todayQuests.find((q) => q.id === action.payload.questId)!,
        ],
      };

    case "SKIP_QUEST":
      return {
        ...state,
        todayQuests: state.todayQuests.map((q) =>
          q.id === action.payload.questId
            ? {
                ...q,
                skipped: true,
                feedback: action.payload.feedback,
              }
            : q
        ),
        selectedQuests: state.selectedQuests.filter(
          (q) => q.id !== action.payload.questId
        ),
        skippedQuests: [
          ...state.skippedQuests,
          state.todayQuests.find((q) => q.id === action.payload.questId)!,
        ],
      };

    case "SET_PREFERENCES":
      return { ...state, preferences: action.payload };

    case "UPDATE_PREFERENCES":
      return {
        ...state,
        preferences: state.preferences
          ? { ...state.preferences, ...action.payload }
          : null,
      };

    case "RESET_QUESTS":
      return {
        ...state,
        todayQuests: [],
        selectedQuests: [],
        completedQuests: [],
        skippedQuests: [],
        lastUpdated: null,
      };

    case "SET_LAST_UPDATED":
      return { ...state, lastUpdated: action.payload };

    default:
      return state;
  }
}

// Context interface
interface QuestContextType {
  state: QuestState;
  generateDailyQuests: () => Promise<void>;
  selectQuest: (questId: string) => Promise<void>;
  deselectQuest: (questId: string) => Promise<void>;
  completeQuest: (questId: string, feedback: QuestFeedback) => Promise<void>;
  skipQuest: (questId: string, feedback: QuestFeedback) => Promise<void>;
  refreshQuests: () => Promise<void>;
  updatePreferences: (preferences: Partial<QuestPreferences>) => Promise<void>;
  loadPreferences: () => Promise<void>;
}

// Create context
const QuestContext = createContext<QuestContextType | undefined>(undefined);

// Provider component
export const QuestProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(questReducer, initialState);
  const [isGeneratingQuests, setIsGeneratingQuests] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Generate daily quests
  const generateDailyQuests = async () => {
    if (isGeneratingQuests) {
      console.log("Quest generation already in progress, skipping...");
      return;
    }

    try {
      setIsGeneratingQuests(true);
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      console.log("Generating daily quests...");
      const preferences = await preferencesService.getQuestPreferences();
      const quests = await questService.generateDailyQuests(preferences);

      console.log(`Generated ${quests.length} quests`);
      dispatch({ type: "SET_TODAY_QUESTS", payload: quests });
      dispatch({ type: "SET_LAST_UPDATED", payload: new Date() });
    } catch (error) {
      console.error("Error generating quests:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to generate quests",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
      setIsGeneratingQuests(false);
    }
  };

  // Select quest
  const selectQuest = async (questId: string) => {
    try {
      // Update local state immediately for better UX
      dispatch({ type: "SELECT_QUEST", payload: questId });

      // Submit to backend
      const success = await questService.selectQuest(questId);
      if (!success) {
        console.warn(
          "Failed to select quest on backend, reverting local state"
        );
        dispatch({ type: "DESELECT_QUEST", payload: questId });
      }
    } catch (error) {
      console.error("Error selecting quest:", error);
      // Revert local state on error
      dispatch({ type: "DESELECT_QUEST", payload: questId });
    }
  };

  // Deselect quest
  const deselectQuest = async (questId: string) => {
    try {
      // Update local state immediately for better UX
      dispatch({ type: "DESELECT_QUEST", payload: questId });

      // Note: Backend doesn't have a deselect endpoint, so we just update local state
      // If needed, we could implement this on the backend
    } catch (error) {
      console.error("Error deselecting quest:", error);
    }
  };

  // Complete quest
  const completeQuest = async (questId: string, feedback: QuestFeedback) => {
    try {
      // Update local state immediately for better UX
      dispatch({ type: "COMPLETE_QUEST", payload: { questId, feedback } });

      // Submit to backend
      const success = await questService.submitQuestFeedback({
        questId,
        feedback,
      });
      if (!success) {
        console.warn("Failed to complete quest on backend");
      }
    } catch (error) {
      console.error("Error completing quest:", error);
      // Could revert state here if needed
    }
  };

  // Skip quest
  const skipQuest = async (questId: string, feedback: QuestFeedback) => {
    try {
      // Update local state immediately for better UX
      dispatch({ type: "SKIP_QUEST", payload: { questId, feedback } });

      // Submit to backend
      const success = await questService.skipQuest(questId);
      if (!success) {
        console.warn("Failed to skip quest on backend");
      }
    } catch (error) {
      console.error("Error skipping quest:", error);
      // Could revert state here if needed
    }
  };

  // Refresh quests
  const refreshQuests = async () => {
    await generateDailyQuests();
  };

  // Update preferences
  const updatePreferences = async (preferences: Partial<QuestPreferences>) => {
    try {
      await preferencesService.updateQuestPreferences(preferences);
      dispatch({ type: "UPDATE_PREFERENCES", payload: preferences });
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  // Load preferences
  const loadPreferences = async () => {
    try {
      const preferences = await preferencesService.getQuestPreferences();
      dispatch({ type: "SET_PREFERENCES", payload: preferences });
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const value: QuestContextType = {
    state,
    generateDailyQuests,
    selectQuest,
    deselectQuest,
    completeQuest,
    skipQuest,
    refreshQuests,
    updatePreferences,
    loadPreferences,
  };

  return (
    <QuestContext.Provider value={value}>{children}</QuestContext.Provider>
  );
};

// Custom hook to use quest context
export const useQuest = (): QuestContextType => {
  const context = useContext(QuestContext);
  if (context === undefined) {
    throw new Error("useQuest must be used within a QuestProvider");
  }
  return context;
};
