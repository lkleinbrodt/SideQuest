import { StyleSheet, View } from "react-native";

import { OnboardingCompletion } from "./OnboardingCompletion";
import { OnboardingNotifications } from "./OnboardingNotifications";
import { OnboardingPreferences } from "./OnboardingPreferences";
import { OnboardingWelcome } from "./OnboardingWelcome";
import React from "react";
import { useOnboarding } from "@/context/OnboardingContext";

export const OnboardingFlow: React.FC = () => {
  const { state } = useOnboarding();

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return <OnboardingWelcome />;
      case 1:
        return <OnboardingPreferences />;
      case 2:
        return <OnboardingNotifications />;
      case 3:
        return <OnboardingCompletion />;
      default:
        return <OnboardingWelcome />;
    }
  };

  return <View style={styles.container}>{renderCurrentStep()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
