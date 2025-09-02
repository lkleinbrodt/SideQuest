import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { QuestDifficulty } from "@/types/types";
import React from "react";

const DIFFICULTY_LEVELS: {
  key: QuestDifficulty;
  label: string;
  description: string;
}[] = [
  { key: "easy", label: "Easy", description: "5-10 minutes, simple tasks" },
  {
    key: "medium",
    label: "Medium",
    description: "10-20 minutes, moderate effort",
  },
  { key: "hard", label: "Hard", description: "20+ minutes, challenging tasks" },
];

export interface DifficultySelectorProps {
  selectedDifficulty: QuestDifficulty;
  onDifficultyChange: (difficulty: QuestDifficulty) => void;
  compact?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultyChange,
  compact = false,
}) => {
  return (
    <View
      style={[styles.difficultyContainer, compact && styles.compactContainer]}
    >
      {DIFFICULTY_LEVELS.map((difficulty) => (
        <TouchableOpacity
          key={difficulty.key}
          style={[
            styles.difficultyButton,
            compact && styles.compactButton,
            selectedDifficulty === difficulty.key &&
              styles.difficultyButtonSelected,
          ]}
          onPress={() => onDifficultyChange(difficulty.key)}
        >
          <Text
            style={[
              styles.difficultyLabel,
              compact && styles.compactLabel,
              selectedDifficulty === difficulty.key &&
                styles.difficultyLabelSelected,
            ]}
          >
            {difficulty.label}
          </Text>
          <Text
            style={[
              styles.difficultyDescription,
              compact && styles.compactDescription,
              selectedDifficulty === difficulty.key &&
                styles.difficultyDescriptionSelected,
            ]}
          >
            {difficulty.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  difficultyContainer: {
    gap: 12,
  },
  compactContainer: {
    gap: 8,
  },
  difficultyButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  compactButton: {
    padding: 12,
  },
  difficultyButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 4,
  },
  compactLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  difficultyLabelSelected: {
    color: Colors.primary,
  },
  difficultyDescription: {
    fontSize: 14,
    color: Colors.mutedText,
  },
  compactDescription: {
    fontSize: 12,
  },
  difficultyDescriptionSelected: {
    color: Colors.primary + "80",
  },
});
