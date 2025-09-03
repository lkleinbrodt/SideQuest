import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { QuestTemplate, votingService } from "@/api/services/votingService";
import React, { useEffect, useState } from "react";

import { AnimatedLoading } from "@/components/common/AnimatedLoading";
import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Error } from "@/components/common/Error";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

export default function VoteScreen() {
  const [questTemplates, setQuestTemplates] = useState<QuestTemplate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    loadQuestTemplates();
  }, []);

  const loadQuestTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const templates = await votingService.getQuestsToVoteOn(10);
      setQuestTemplates(templates);
      setCurrentIndex(0);
    } catch (err) {
      setError("Failed to load quests to vote on");
      console.error("Error loading quest templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (
    questTemplate: QuestTemplate,
    vote: "thumbs_up" | "thumbs_down"
  ) => {
    try {
      setVoting(true);
      console.log("Submitting vote:", { questId: questTemplate.id, vote });

      await votingService.submitVote(questTemplate.id, vote);
      console.log("Vote submitted successfully");

      // Remove the voted quest from the current list
      setQuestTemplates((prev) => {
        const newTemplates = prev.filter(
          (template) => template.id !== questTemplate.id
        );
        console.log("Removed voted quest from list:", {
          questId: questTemplate.id,
          remainingQuests: newTemplates.length,
        });
        return newTemplates;
      });

      // If we're at the end of the list or have no more quests, load more
      if (
        currentIndex >= questTemplates.length - 4 ||
        questTemplates.length <= 1
      ) {
        console.log("Loading more quests...");
        loadMoreQuests();
      } else {
        // Stay at the same index since we removed the current quest
        console.log("Staying at current index:", currentIndex);
      }
    } catch (err) {
      console.error("Error submitting vote:", err);
      Alert.alert("Error", "Failed to submit vote. Please try again.");
    } finally {
      setVoting(false);
    }
  };

  const loadMoreQuests = async () => {
    try {
      const newTemplates = await votingService.getQuestsToVoteOn(5);
      setQuestTemplates((prev) => {
        const combined = [...prev, ...newTemplates];
        // Reset index to 0 if we had no quests before
        if (prev.length === 0) {
          setCurrentIndex(0);
        }
        return combined;
      });
    } catch (err) {
      console.error("Error loading more quest templates:", err);
    }
  };

  const handleThumbsUp = () => {
    // Safety check
    if (currentIndex >= questTemplates.length || currentIndex < 0) {
      console.warn("Invalid currentIndex for thumbs up:", currentIndex);
      return;
    }

    const currentQuest = questTemplates[currentIndex];
    if (currentQuest) {
      console.log("Thumbs up pressed for quest:", currentQuest.id);
      submitVote(currentQuest, "thumbs_up");
    }
  };

  const handleThumbsDown = () => {
    // Safety check
    if (currentIndex >= questTemplates.length || currentIndex < 0) {
      console.warn("Invalid currentIndex for thumbs down:", currentIndex);
      return;
    }

    const currentQuest = questTemplates[currentIndex];
    if (currentQuest) {
      console.log("Thumbs down pressed for quest:", currentQuest.id);
      submitVote(currentQuest, "thumbs_down");
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Error text={error} onRetry={loadQuestTemplates} />
      </SafeAreaView>
    );
  }

  if (questTemplates.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            You've voted on all available quests. Check back later for more!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuest = questTemplates[currentIndex];

  if (!currentQuest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="refresh" size={64} color={Colors.primary} />
          <Text style={styles.emptyTitle}>Loading more quests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vote on Quests</Text>
        <Text style={styles.subtitle}>
          Voting helps improve your quest quality
        </Text>
        <Text style={styles.subsubtitle}>
          Adding personal notes helps even more!
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Card style={styles.questCard}>
          <View style={styles.questHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {currentQuest.category.toUpperCase()}
              </Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {currentQuest.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.questText}>{currentQuest.text}</Text>

          <View style={styles.questFooter}>
            <Text style={styles.estimatedTime}>
              {currentQuest.estimatedTime}
            </Text>
            {currentQuest.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {currentQuest.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card>
      </View>

      <View style={styles.actionButtons}>
        <View style={styles.buttonContainer}>
          <View
            style={[
              styles.actionButton,
              styles.rejectButton,
              { opacity: voting ? 0.5 : 1 },
            ]}
          >
            <Ionicons
              name="thumbs-down"
              size={32}
              color={Colors.white}
              onPress={handleThumbsDown}
            />
          </View>

          <View
            style={[
              styles.actionButton,
              styles.approveButton,
              { opacity: voting ? 0.5 : 1 },
            ]}
          >
            <Ionicons
              name="thumbs-up"
              size={32}
              color={Colors.white}
              onPress={handleThumbsUp}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.darkText,
    marginBottom: 8,
  },
  subsubtitle: {
    fontSize: 10,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: "center",
    lineHeight: 22,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  questCard: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    minHeight: 300,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  difficultyBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  questText: {
    fontSize: 18,
    lineHeight: 26,
    color: Colors.darkText,
    marginBottom: 20,
    textAlign: "center",
  },
  questFooter: {
    alignItems: "center",
  },
  estimatedTime: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tag: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  tagText: {
    fontSize: 12,
    color: Colors.mutedText,
  },
  actionButtons: {
    alignItems: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 200,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  progressContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: Colors.mutedText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.darkText,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: "center",
    lineHeight: 22,
  },
});
