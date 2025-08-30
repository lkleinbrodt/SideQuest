import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Quest {
  id: string;
  text: string;
  category: string;
  estimatedTime: string;
  selected: boolean;
  completed: boolean;
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: "1",
      text: "Take a 10-minute walk outside and notice 3 things you haven't seen before",
      category: "outdoors",
      estimatedTime: "10 min",
      selected: false,
      completed: false,
    },
    {
      id: "2",
      text: "Text a friend you haven't talked to in a while with a fun question",
      category: "social",
      estimatedTime: "5 min",
      selected: false,
      completed: false,
    },
    {
      id: "3",
      text: "Try a new recipe with ingredients you already have at home",
      category: "hobbies",
      estimatedTime: "15 min",
      selected: false,
      completed: false,
    },
  ]);

  const toggleQuestSelection = (questId: string) => {
    setQuests((prevQuests) =>
      prevQuests.map((quest) =>
        quest.id === questId ? { ...quest, selected: !quest.selected } : quest
      )
    );
  };

  const markQuestComplete = (questId: string) => {
    setQuests((prevQuests) =>
      prevQuests.map((quest) =>
        quest.id === questId ? { ...quest, completed: true } : quest
      )
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fitness":
        return Colors.fitness;
      case "social":
        return Colors.social;
      case "mindfulness":
        return Colors.mindfulness;
      case "chores":
        return Colors.chores;
      case "hobbies":
        return Colors.hobbies;
      case "outdoors":
        return Colors.outdoors;
      default:
        return Colors.secondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fitness":
        return "fitness";
      case "social":
        return "people";
      case "mindfulness":
        return "leaf";
      case "chores":
        return "home";
      case "hobbies":
        return "brush";
      case "outdoors":
        return "sunny";
      default:
        return "star";
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Today's Quests</Text>
          <Text style={styles.subtitle}>Choose your adventures for today</Text>
        </View>

        <View style={styles.questsContainer}>
          {quests.map((quest) => (
            <Card
              key={quest.id}
              variant="elevated"
              style={[
                styles.questCard,
                quest.selected && styles.selectedQuest,
                quest.completed && styles.completedQuest,
              ]}
            >
              <View style={styles.questHeader}>
                <View style={styles.categoryContainer}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(quest.category) },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(quest.category) as any}
                      size={16}
                      color={Colors.white}
                    />
                  </View>
                  <Text style={styles.categoryText}>
                    {quest.category.charAt(0).toUpperCase() +
                      quest.category.slice(1)}
                  </Text>
                </View>
                <Text style={styles.estimatedTime}>{quest.estimatedTime}</Text>
              </View>

              <Text style={styles.questText}>{quest.text}</Text>

              <View style={styles.questActions}>
                <Button
                  title={quest.selected ? "Selected" : "Select"}
                  onPress={() => toggleQuestSelection(quest.id)}
                  variant={quest.selected ? "primary" : "outline"}
                  size="small"
                  style={styles.actionButton}
                />

                {quest.selected && !quest.completed && (
                  <Button
                    title="Complete"
                    onPress={() => markQuestComplete(quest.id)}
                    variant="success"
                    size="small"
                    style={styles.actionButton}
                  />
                )}

                {quest.completed && (
                  <View style={styles.completedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.success}
                    />
                    <Text style={styles.completedText}>Completed!</Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {quests.filter((q) => q.selected).length} of {quests.length} quests
            selected
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Layout.spacing.l,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: "center",
  },
  questsContainer: {
    paddingHorizontal: Layout.spacing.m,
  },
  questCard: {
    marginBottom: Layout.spacing.m,
    padding: Layout.spacing.l,
  },
  selectedQuest: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  completedQuest: {
    backgroundColor: Colors.questCompleted,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.m,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.xs,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.mutedText,
    textTransform: "capitalize",
  },
  estimatedTime: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "500",
  },
  questText: {
    fontSize: 16,
    color: Colors.darkText,
    lineHeight: 24,
    marginBottom: Layout.spacing.l,
  },
  questActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  completedText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.success,
    marginLeft: Layout.spacing.xs,
  },
  footer: {
    padding: Layout.spacing.l,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: "center",
  },
});
