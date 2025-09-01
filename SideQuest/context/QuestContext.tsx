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
  questBoard: Quest[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  preferences: QuestPreferences | null;
}

// Action types
type QuestAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_QUEST_BOARD"; payload: Quest[] }
  | { type: "UPDATE_SINGLE_QUEST"; payload: Quest }
  | { type: "SET_PREFERENCES"; payload: QuestPreferences }
  | { type: "UPDATE_PREFERENCES"; payload: Partial<QuestPreferences> }
  | { type: "RESET_QUEST_BOARD" }
  | { type: "SET_LAST_UPDATED"; payload: string };

// Initial state
const initialState: QuestState = {
  questBoard: [],
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

    case "SET_QUEST_BOARD":
      return {
        ...state,
        questBoard: action.payload,
      };

    case "UPDATE_SINGLE_QUEST":
      return {
        ...state,
        questBoard: state.questBoard.map((quest) =>
          quest.id === action.payload.id ? action.payload : quest
        ),
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

    case "RESET_QUEST_BOARD":
      return {
        ...state,
        questBoard: [],
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
  loadQuestBoard: () => Promise<void>;
  refreshQuestBoard: () => Promise<void>;
  updateQuestStatus: (
    questId: string,
    status: string,
    feedback?: any
  ) => Promise<void>;
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
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  // Load preferences on mount
  // only if we are authenticated
  useEffect(() => {
    loadPreferences();
  }, []);

  // Load quest board
  const loadQuestBoard = async () => {
    if (isLoadingBoard) {
      console.log("Quest board loading already in progress, skipping...");
      return;
    }

    try {
      setIsLoadingBoard(true);
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      console.log("Loading quest board...");
      const board = await questService.getQuestBoard();

      console.log(`Got ${board.quests.length} quests from board`);
      dispatch({ type: "SET_QUEST_BOARD", payload: board.quests });
      dispatch({ type: "SET_LAST_UPDATED", payload: new Date().toISOString() });
    } catch (error) {
      console.error("Error loading quest board:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load quest board";
      console.log("Setting error state:", errorMessage);
      dispatch({
        type: "SET_ERROR",
        payload: errorMessage,
      });
      // Clear the quest board when there's an error
      dispatch({ type: "SET_QUEST_BOARD", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
      setIsLoadingBoard(false);
    }
  };

  // Refresh quest board
  const refreshQuestBoard = async () => {
    if (isLoadingBoard) {
      console.log("Quest board refresh already in progress, skipping...");
      return;
    }

    try {
      setIsLoadingBoard(true);
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      console.log("Refreshing quest board...");
      const board = await questService.refreshQuestBoard();

      console.log(
        `Refreshed quest board, got ${board.quests.length} new quests`
      );
      dispatch({ type: "SET_QUEST_BOARD", payload: board.quests });
      dispatch({ type: "SET_LAST_UPDATED", payload: new Date().toISOString() });
    } catch (error) {
      console.error("Error refreshing quest board:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to refresh quest board";
      console.log("Setting error state:", errorMessage);
      dispatch({
        type: "SET_ERROR",
        payload: errorMessage,
      });
      // Clear the quest board when there's an error
      dispatch({ type: "SET_QUEST_BOARD", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
      setIsLoadingBoard(false);
    }
  };

  // Consolidated quest status update
  const updateQuestStatus = async (
    questId: string,
    status: string,
    feedback?: any
  ) => {
    try {
      const updatedQuest = await questService.updateQuestStatus(
        questId,
        status as any,
        feedback
      );
      // Update the board with the single returned quest
      dispatch({ type: "UPDATE_SINGLE_QUEST", payload: updatedQuest });
    } catch (error) {
      console.error(`Error updating quest to ${status}:`, error);
      const apiError = error as any;
      // Optionally, dispatch an action to show a temporary error message to the user
      dispatch({ type: "SET_ERROR", payload: apiError.message });
    }
  };

  // Update preferences
  const updatePreferences = async (preferences: Partial<QuestPreferences>) => {
    try {
      await preferencesService.updateUserProfile(preferences);
      dispatch({ type: "UPDATE_PREFERENCES", payload: preferences });
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  // Load preferences
  const loadPreferences = async () => {
    try {
      const profile = await preferencesService.getUserProfile();
      const preferences: QuestPreferences = {
        categories: profile.categories,
        difficulty: profile.difficulty,
        maxTime: profile.maxTime,
        includeCompleted: profile.includeCompleted,
        includeSkipped: profile.includeSkipped,
      };
      dispatch({ type: "SET_PREFERENCES", payload: preferences });
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const value: QuestContextType = {
    state,
    loadQuestBoard,
    refreshQuestBoard,
    updateQuestStatus,
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
