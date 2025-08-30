import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Quest, QuestFeedback } from "@/types/quest";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import React from "react";

interface QuestCardProps {
  quest: Quest;
  onSelect: (questId: string) => void;
  onComplete: (questId: string) => void;
  onSkip: (questId: string) => void;
  onFeedback: (questId: string, feedback: QuestFeedback) => void;
  showActions?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onSelect,
  onComplete,
  onSkip,
  onFeedback,
  showActions = true,
}) => {
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
      case "learning":
        return Colors.learning;
      case "creativity":
        return Colors.creativity;
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
      case "learning":
        return "school";
      case "creativity":
        return "color-palette";
      default:
        return "star";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return Colors.success;
      case "medium":
        return Colors.warning;
      case "hard":
        return Colors.error;
      default:
        return Colors.secondary;
    }
  };

  const handleComplete = () => {
    Alert.alert("Complete Quest", "How was this quest?", [
      {
        text: "Thumbs Down",
        style: "destructive",
        onPress: () => {
          onComplete(quest.id);
          onFeedback(quest.id, {
            rating: "thumbs_down",
            completed: true,
          });
        },
      },
      {
        text: "Thumbs Up",
        style: "default",
        onPress: () => {
          onComplete(quest.id);
          onFeedback(quest.id, {
            rating: "thumbs_up",
            completed: true,
          });
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleSkip = () => {
    Alert.alert("Skip Quest", "Are you sure you want to skip this quest?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Skip",
        style: "destructive",
        onPress: () => {
          onSkip(quest.id);
          onFeedback(quest.id, {
            rating: null,
            completed: false,
          });
        },
      },
    ]);
  };

  const isExpired = new Date() > quest.expiresAt;

  return (
    <Card
      variant="elevated"
      style={[
        styles.container,
        quest.selected && styles.selected,
        quest.completed && styles.completed,
        quest.skipped && styles.skipped,
        isExpired && styles.expired,
      ]}
    >
      {/* Header with category and difficulty */}
      <View style={styles.header}>
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
            {quest.category.charAt(0).toUpperCase() + quest.category.slice(1)}
          </Text>
        </View>

        <View style={styles.metaContainer}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(quest.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>
              {quest.difficulty.charAt(0).toUpperCase() +
                quest.difficulty.slice(1)}
            </Text>
          </View>
          <Text style={styles.timeText}>{quest.estimatedTime}</Text>
        </View>
      </View>

      {/* Quest text */}
      <Text style={styles.questText}>{quest.text}</Text>

      {/* Tags */}
      {quest.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {quest.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Status indicators */}
      <View style={styles.statusContainer}>
        {quest.completed && (
          <View style={styles.statusBadge}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.success}
            />
            <Text style={styles.statusText}>Completed!</Text>
          </View>
        )}

        {quest.skipped && (
          <View style={styles.statusBadge}>
            <Ionicons name="close-circle" size={20} color={Colors.warning} />
            <Text style={styles.statusText}>Skipped</Text>
          </View>
        )}

        {isExpired && (
          <View style={styles.statusBadge}>
            <Ionicons name="time" size={20} color={Colors.error} />
            <Text style={styles.statusText}>Expired</Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      {showActions && !quest.completed && !quest.skipped && !isExpired && (
        <View style={styles.actionsContainer}>
          <Button
            title={quest.selected ? "Selected" : "Select"}
            onPress={() => onSelect(quest.id)}
            variant={quest.selected ? "primary" : "outline"}
            size="small"
            style={styles.actionButton}
          />

          {quest.selected && (
            <>
              <Button
                title="Complete"
                onPress={handleComplete}
                variant="success"
                size="small"
                style={styles.actionButton}
              />
              <Button
                title="Skip"
                onPress={handleSkip}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
            </>
          )}
        </View>
      )}

      {/* Feedback if completed */}
      {quest.completed && quest.feedback && (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackRow}>
            <Ionicons
              name={
                quest.feedback.rating === "thumbs_up"
                  ? "thumbs-up"
                  : "thumbs-down"
              }
              size={20}
              color={
                quest.feedback.rating === "thumbs_up"
                  ? Colors.success
                  : Colors.error
              }
            />
            <Text style={styles.feedbackText}>
              {quest.feedback.rating === "thumbs_up"
                ? "Liked this quest!"
                : "Didn't enjoy this quest"}
            </Text>
          </View>
          {quest.feedback.comment && (
            <Text style={styles.commentText}>{quest.feedback.comment}</Text>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.m,
    padding: Layout.spacing.l,
  },
  selected: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  completed: {
    backgroundColor: Colors.questCompleted,
  },
  skipped: {
    backgroundColor: Colors.questSkipped,
  },
  expired: {
    opacity: 0.6,
    backgroundColor: Colors.questExpired,
  },
  header: {
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
  metaContainer: {
    alignItems: "flex-end",
  },
  difficultyBadge: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: Layout.spacing.xs,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.white,
    textTransform: "capitalize",
  },
  timeText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "500",
  },
  questText: {
    fontSize: 16,
    color: Colors.darkText,
    lineHeight: 24,
    marginBottom: Layout.spacing.m,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Layout.spacing.m,
  },
  tag: {
    backgroundColor: Colors.tagBackground,
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  tagText: {
    fontSize: 12,
    color: Colors.tagText,
    fontWeight: "500",
  },
  statusContainer: {
    marginBottom: Layout.spacing.m,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.success,
    marginLeft: Layout.spacing.xs,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  feedbackContainer: {
    marginTop: Layout.spacing.m,
    paddingTop: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.spacing.xs,
  },
  feedbackText: {
    fontSize: 14,
    color: Colors.mutedText,
    marginLeft: Layout.spacing.xs,
  },
  commentText: {
    fontSize: 14,
    color: Colors.darkText,
    fontStyle: "italic",
    marginLeft: 24,
  },
});
