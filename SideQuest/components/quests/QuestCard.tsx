import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Quest, QuestFeedback } from "@/types/quest";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import { QuestCategory } from "@/types/quest";
import React from "react";

const categoryImages = {
  fitness: require("@/assets/category-badges/fitness_1_transparent.png"),
  social: require("@/assets/category-badges/social_1_transparent.png"),
  mindfulness: require("@/assets/category-badges/mindfulness_1_transparent.png"),
  chores: require("@/assets/category-badges/chores_1_transparent.png"),
  hobbies: require("@/assets/category-badges/hobbies_1_transparent.png"),
  outdoors: require("@/assets/category-badges/outdoors_1_transparent.png"),
  learning: require("@/assets/category-badges/learning_1_transparent.png"),
  creativity: require("@/assets/category-badges/creativity_1_transparent.png"),
};
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

  const getCategoryAsset = (category: QuestCategory) => {
    return categoryImages[category] || categoryImages.fitness;
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
      <Image
        source={getCategoryAsset(quest.category)}
        style={styles.categoryIcon}
        resizeMode="contain"
      />
      {/* Quest text */}
      <Text style={styles.questText}>{quest.text}</Text>

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
          {!quest.selected && (
            <Button
              title={quest.selected ? "Selected" : "Select"}
              onPress={() => onSelect(quest.id)}
              variant={quest.selected ? "primary" : "outline"}
              size="small"
              style={styles.actionButton}
            />
          )}

          {quest.selected && (
            <>
              <Button
                title="Skip"
                onPress={handleSkip}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
              <Button
                title="Complete"
                onPress={handleComplete}
                variant="success"
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

const BADGE_SIZE = 128;

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
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
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
  categoryIcon: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
  },
});
