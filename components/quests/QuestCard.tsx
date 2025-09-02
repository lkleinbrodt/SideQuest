import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Quest, QuestFeedback } from "@/types/quest";
import React, { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import { QuestCategory } from "@/types/quest";
import { QuestCompletionModal } from "./QuestCompletionModal";

const BADGE_SIZE = 40;

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
  onAccept?: (questId: string) => void;
  onDecline?: (questId: string) => void;
  onComplete?: (questId: string, feedback: QuestFeedback) => void;
  onAbandon?: (questId: string) => void;
  showActions?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onAccept,
  onDecline,
  onComplete,
  onAbandon,
  showActions = true,
}) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
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
    setShowCompletionModal(true);
  };

  const handleFeedbackSubmit = (feedback: QuestFeedback) => {
    if (onComplete) {
      onComplete(quest.id, feedback);
    }
  };

  const handleAbandon = () => {
    Alert.alert(
      "Abandon Quest",
      "Are you sure you want to abandon this quest?",
      [
        {
          text: "Yes, Abandon",
          style: "destructive",
          onPress: () => {
            if (onAbandon) {
              onAbandon(quest.id);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleDecline = () => {
    Alert.alert(
      "Decline Quest",
      "Are you sure you want to decline this quest?",
      [
        {
          text: "Yes, Decline",
          style: "destructive",
          onPress: () => {
            if (onDecline) {
              onDecline(quest.id);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const getStatusColor = () => {
    switch (quest.status) {
      case "potential":
        return Colors.primary;
      case "accepted":
        return Colors.warning;
      case "completed":
        return Colors.success;
      case "failed":
        return Colors.error;
      case "abandoned":
        return Colors.mutedText;
      case "declined":
        return Colors.mutedText;
      default:
        return Colors.secondary;
    }
  };

  const getStatusText = () => {
    switch (quest.status) {
      case "potential":
        return "Available";
      case "accepted":
        return "In Progress";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "abandoned":
        return "Abandoned";
      case "declined":
        return "Declined";
      default:
        return "Unknown";
    }
  };

  const renderActions = () => {
    if (!showActions) return null;

    switch (quest.status) {
      case "potential":
        return (
          <View style={styles.actionButtons}>
            {onAccept && (
              <Button
                title="Accept"
                onPress={() => onAccept(quest.id)}
                style={[styles.actionButton, styles.acceptButton]}
                textStyle={styles.actionButtonText}
              />
            )}
            {onDecline && (
              <Button
                title="Decline"
                onPress={handleDecline}
                style={[styles.actionButton, styles.declineButton]}
                textStyle={styles.actionButtonText}
              />
            )}
          </View>
        );

      case "accepted":
        return (
          <View style={styles.actionButtons}>
            {onComplete && (
              <Button
                title="Complete"
                onPress={handleComplete}
                style={[styles.actionButton, styles.completeButton]}
                textStyle={styles.actionButtonText}
              />
            )}
            {onAbandon && (
              <Button
                title="Abandon"
                onPress={handleAbandon}
                style={[styles.actionButton, styles.abandonButton]}
                textStyle={styles.actionButtonText}
              />
            )}
          </View>
        );

      case "abandoned":
        return (
          <View style={styles.actionButtons}>
            {onAccept && (
              <Button
                title="Pick Up Again"
                onPress={() => onAccept(quest.id)}
                style={[styles.actionButton, styles.acceptButton]}
                textStyle={styles.actionButtonText}
              />
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Image
            source={getCategoryAsset(quest.category)}
            style={styles.categoryImage}
          />
          <View style={styles.categoryInfo}>
            <Text
              style={[
                styles.category,
                { color: getCategoryColor(quest.category) },
              ]}
            >
              {quest.category}
            </Text>
            <Text style={styles.estimatedTime}>{quest.estimatedTime}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
          >
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.questText}>{quest.text}</Text>

      <View style={styles.footer}>
        <View style={styles.tags}>
          {quest.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.difficultyContainer}>
          <Text
            style={[
              styles.difficulty,
              { color: getDifficultyColor(quest.difficulty) },
            ]}
          >
            {quest.difficulty}
          </Text>
        </View>
      </View>

      {renderActions()}

      <QuestCompletionModal
        visible={showCompletionModal}
        questText={quest.text}
        onClose={() => setShowCompletionModal(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Layout.spacing.m,
    padding: Layout.spacing.l,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Layout.spacing.m,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryImage: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    marginRight: Layout.spacing.xs,
  },
  categoryInfo: {
    flex: 1,
  },
  category: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  estimatedTime: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: Layout.spacing.xs,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  questText: {
    fontSize: 16,
    color: Colors.darkText,
    lineHeight: 24,
    marginBottom: Layout.spacing.m,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Layout.spacing.m,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  tagText: {
    fontSize: 12,
    color: Colors.mutedText,
    fontWeight: "500",
  },
  difficultyContainer: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  difficulty: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Layout.spacing.m,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  actionButtonText: {
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  declineButton: {
    backgroundColor: Colors.error,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  abandonButton: {
    backgroundColor: Colors.mutedText,
  },
});
