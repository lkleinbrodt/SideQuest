import { OnboardingProvider, useOnboarding } from "../OnboardingContext";
import { render, screen } from "@testing-library/react-native";

import React from "react";

// Test component that uses the context
const TestComponent = () => {
  const { state, nextStep, previousStep } = useOnboarding();

  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="total-steps">{state.totalSteps}</div>
      <button data-testid="next-button" onClick={nextStep}>
        Next
      </button>
      <button data-testid="prev-button" onClick={previousStep}>
        Previous
      </button>
    </div>
  );
};

describe("OnboardingContext", () => {
  it("provides initial state correctly", () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    expect(screen.getByTestId("current-step")).toHaveTextContent("0");
    expect(screen.getByTestId("total-steps")).toHaveTextContent("4");
  });

  it("can navigate to next step", () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const nextButton = screen.getByTestId("next-button");
    nextButton.click();

    expect(screen.getByTestId("current-step")).toHaveTextContent("1");
  });

  it("can navigate to previous step", () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const nextButton = screen.getByTestId("next-button");
    const prevButton = screen.getByTestId("prev-button");

    nextButton.click(); // Go to step 1
    prevButton.click(); // Go back to step 0

    expect(screen.getByTestId("current-step")).toHaveTextContent("0");
  });
});
