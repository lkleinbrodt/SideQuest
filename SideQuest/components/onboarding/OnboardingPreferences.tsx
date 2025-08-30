import { QuestCategory, QuestDifficulty } from "@/types/quest";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "@/context/OnboardingContext";

const QUEST_CATEGORIES: { key: QuestCategory; label: string; emoji: string }[] =
  [
    { key: "fitness", label: "Fitness", emoji: "💪" },
    { key: "social", label: "Social", emoji: "👥" },
    { key: "mindfulness", label: "Mindfulness", emoji: "🧘" },
    { key: "hobbies", label: "Hobbies", emoji: "🎨" },
    { key: "outdoors", label: "Outdoors", emoji: "🌲" },
    { key: "learning", label: "Learning", emoji: "📚" },
    { key: "creativity", label: "Creativity", emoji: "✨" },
    { key: "chores", label: "Chores", emoji: "🏠" },
  ];

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

export const OnboardingPreferences: React.FC = () => {
  const { nextStep, previousStep, updateOnboardingData, state } =
    useOnboarding();

  const [selectedCategories, setSelectedCategories] = useState<QuestCategory[]>(
    state.data.preferredCategories || ["fitness", "social", "mindfulness"]
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestDifficulty>(
    state.data.preferredDifficulty || "easy"
  );
  const [maxTime, setMaxTime] = useState<number>(
    state.data.maxTimePerQuest || 15
  );

  const toggleCategory = (category: QuestCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleNext = () => {
    updateOnboardingData({
      preferredCategories: selectedCategories,
      preferredDifficulty: selectedDifficulty,
      maxTimePerQuest: maxTime,
    });
    nextStep();
  };

  const canContinue = selectedCategories.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Customize Your Experience</Text>
          <Text style={styles.subtitle}>
            Choose what types of quests you'd like to receive
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quest Categories</Text>
          <Text style={styles.sectionDescription}>
            Select the types of activities that interest you most
          </Text>

          <View style={styles.categoriesGrid}>
            {QUEST_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  selectedCategories.includes(category.key) &&
                    styles.categoryButtonSelected,
                ]}
                onPress={() => toggleCategory(category.key)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategories.includes(category.key) &&
                      styles.categoryLabelSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <Text style={styles.sectionDescription}>
            Choose how challenging you want your quests to be
          </Text>

          <View style={styles.difficultyContainer}>
            {DIFFICULTY_LEVELS.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.key}
                style={[
                  styles.difficultyButton,
                  selectedDifficulty === difficulty.key &&
                    styles.difficultyButtonSelected,
                ]}
                onPress={() => setSelectedDifficulty(difficulty.key)}
              >
                <Text
                  style={[
                    styles.difficultyLabel,
                    selectedDifficulty === difficulty.key &&
                      styles.difficultyLabelSelected,
                  ]}
                >
                  {difficulty.label}
                </Text>
                <Text
                  style={[
                    styles.difficultyDescription,
                    selectedDifficulty === difficulty.key &&
                      styles.difficultyDescriptionSelected,
                  ]}
                >
                  {difficulty.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Commitment</Text>
          <Text style={styles.sectionDescription}>
            Maximum time you want to spend on each quest
          </Text>

          <View style={styles.timeContainer}>
            <Text style={styles.timeValue}>{maxTime} minutes</Text>
            <View style={styles.timeSlider}>
              {[5, 10, 15, 20, 30].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    maxTime === time && styles.timeOptionSelected,
                  ]}
                  onPress={() => setMaxTime(time)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      maxTime === time && styles.timeOptionTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={previousStep}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleNext}
            disabled={!canContinue}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 16,
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryButton: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: Colors.white,
  },
  categoryButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondary,
  },
  categoryLabelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  difficultyContainer: {
    gap: 12,
  },
  difficultyButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
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
  difficultyLabelSelected: {
    color: Colors.primary,
  },
  difficultyDescription: {
    fontSize: 14,
    color: Colors.mutedText,
  },
  difficultyDescriptionSelected: {
    color: Colors.primary + "80",
  },
  timeContainer: {
    alignItems: "center",
  },
  timeValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 16,
  },
  timeSlider: {
    flexDirection: "row",
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  timeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondary,
  },
  timeOptionTextSelected: {
    color: Colors.white,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
});
