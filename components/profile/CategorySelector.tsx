import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { QuestCategory } from "@/types/types";
import React from "react";

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

export interface CategorySelectorProps {
  selectedCategories: QuestCategory[];
  onCategoriesChange: (categories: QuestCategory[]) => void;
  compact?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onCategoriesChange,
  compact = false,
}) => {
  const toggleCategory = (category: QuestCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <View style={[styles.categoriesGrid, compact && styles.compactGrid]}>
      {QUEST_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryButton,
            compact && styles.compactCategoryButton,
            selectedCategories.includes(category.key) &&
              styles.categoryButtonSelected,
          ]}
          onPress={() => toggleCategory(category.key)}
        >
          <Text style={[styles.categoryEmoji, compact && styles.compactEmoji]}>
            {category.emoji}
          </Text>
          <Text
            style={[
              styles.categoryLabel,
              compact && styles.compactLabel,
              selectedCategories.includes(category.key) &&
                styles.categoryLabelSelected,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  compactGrid: {
    gap: 8,
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
  compactCategoryButton: {
    width: "31%",
    padding: 12,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  compactEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondary,
  },
  compactLabel: {
    fontSize: 12,
  },
  categoryLabelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
