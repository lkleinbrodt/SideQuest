import React, { ReactNode, createContext, useContext, useReducer } from "react";

import { OnboardingData } from "@/api/services/preferencesService";

// Onboarding state interface
interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  data: Partial<OnboardingData>;
  isLoading: boolean;
  error: string | null;
}

// Onboarding action types
type OnboardingAction =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "UPDATE_DATA"; payload: Partial<OnboardingData> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_ONBOARDING" }
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" };

// Initial state
const initialState: OnboardingState = {
  currentStep: 0,
  totalSteps: 4, // Welcome, Preferences, Notifications, Completion
  data: {},
  isLoading: false,
  error: null,
};

// Reducer function
function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: Math.max(
          0,
          Math.min(action.payload, state.totalSteps - 1)
        ),
      };

    case "UPDATE_DATA":
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "RESET_ONBOARDING":
      return { ...initialState };

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
      };

    case "PREVIOUS_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    default:
      return state;
  }
}

// Context interface
interface OnboardingContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number; // 0 to 1
}

// Create context
const OnboardingContext = createContext<OnboardingContextType | null>(null);

// Provider component
export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const goToStep = (step: number) => {
    dispatch({ type: "SET_CURRENT_STEP", payload: step });
  };

  const nextStep = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  const previousStep = () => {
    dispatch({ type: "PREVIOUS_STEP" });
  };

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    dispatch({ type: "UPDATE_DATA", payload: data });
  };

  const resetOnboarding = () => {
    dispatch({ type: "RESET_ONBOARDING" });
  };

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === state.totalSteps - 1;
  const progress = (state.currentStep + 1) / state.totalSteps;

  const value: OnboardingContextType = {
    state,
    dispatch,
    goToStep,
    nextStep,
    previousStep,
    updateOnboardingData,
    resetOnboarding,
    isFirstStep,
    isLastStep,
    progress,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Hook to use the context
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
