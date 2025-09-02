import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface QuestHistory {
  id: string;
  date: string;
  quests: {
    id: string;
    text: string;
    category: string;
    completed: boolean;
    skipped: boolean;
  }[];
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  // Mock data - in real app this would come from API
  const history: QuestHistory[] = [
    {
      id: "1",
      date: "2024-01-15",
      quests: [
        {
          id: "1",
          text: "Take a 10-minute walk outside and notice 3 things you haven't seen before",
          category: "outdoors",
          completed: true,
          skipped: false,
        },
        {
          id: "2",
          text: "Text a friend you haven't talked to in a while with a fun question",
          category: "social",
          completed: false,
          skipped: true,
        },
        {
          id: "3",
          text: "Try a new recipe with ingredients you already have at home",
          category: "hobbies",
          completed: true,
          skipped: false,
        },
      ],
    },
    {
      id: "2",
      date: "2024-01-14",
      quests: [
        {
          id: "1",
          text: "Do 10 minutes of stretching or yoga",
          category: "fitness",
          completed: true,
          skipped: false,
        },
        {
          id: "2",
          text: "Write down 3 things you're grateful for today",
          category: "mindfulness",
          completed: true,
          skipped: false,
        },
        {
          id: "3",
          text: "Organize one small area of your home",
          category: "chores",
          completed: false,
          skipped: true,
        },
      ],
    },
  ];

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getCompletionStats = (quests: QuestHistory["quests"]) => {
    const completed = quests.filter((q) => q.completed).length;
    const skipped = quests.filter((q) => q.skipped).length;
    const total = quests.length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, skipped, total, completionRate };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Quest History</Text>
          <Text style={styles.subtitle}>Track your daily adventures</Text>
        </View>

        <View style={styles.statsContainer}>
          <Card variant="outlined" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {history.reduce(
                    (acc, day) =>
                      acc + getCompletionStats(day.quests).completed,
                    0
                  )}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {history.reduce(
                    (acc, day) => acc + getCompletionStats(day.quests).skipped,
                    0
                  )}
                </Text>
                <Text style={styles.statLabel}>Skipped</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round(
                    history.reduce((acc, day) => {
                      const stats = getCompletionStats(day.quests);
                      return acc + stats.completionRate;
                    }, 0) / history.length
                  )}
                  %
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.historyContainer}>
          {history.map((day) => {
            const stats = getCompletionStats(day.quests);
            return (
              <Card key={day.id} variant="default" style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                  <View style={styles.dayStats}>
                    <Text style={styles.dayStatsText}>
                      {stats.completed}/{stats.total} completed
                    </Text>
                  </View>
                </View>

                <View style={styles.questsList}>
                  {day.quests.map((quest) => (
                    <View key={quest.id} style={styles.questItem}>
                      <View style={styles.questInfo}>
                        <View style={styles.categoryContainer}>
                          <View
                            style={[
                              styles.categoryBadge,
                              {
                                backgroundColor: getCategoryColor(
                                  quest.category
                                ),
                              },
                            ]}
                          >
                            <Ionicons
                              name={getCategoryIcon(quest.category) as any}
                              size={12}
                              color={Colors.white}
                            />
                          </View>
                          <Text style={styles.categoryText}>
                            {quest.category.charAt(0).toUpperCase() +
                              quest.category.slice(1)}
                          </Text>
                        </View>

                        <View style={styles.questStatus}>
                          {quest.completed ? (
                            <View style={styles.statusBadge}>
                              <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={Colors.success}
                              />
                              <Text style={styles.statusText}>Completed</Text>
                            </View>
                          ) : quest.skipped ? (
                            <View style={styles.statusBadge}>
                              <Ionicons
                                name="close-circle"
                                size={16}
                                color={Colors.error}
                              />
                              <Text style={styles.statusText}>Skipped</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      <Text style={styles.questText} numberOfLines={2}>
                        {quest.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            );
          })}
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
  statsContainer: {
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.l,
  },
  statsCard: {
    padding: Layout.spacing.l,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  historyContainer: {
    paddingHorizontal: Layout.spacing.m,
  },
  dayCard: {
    marginBottom: Layout.spacing.m,
    padding: Layout.spacing.l,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.m,
    paddingBottom: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
  },
  dayStats: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.components.button.borderRadius.small,
  },
  dayStatsText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.mutedText,
  },
  questsList: {
    gap: Layout.spacing.m,
  },
  questItem: {
    padding: Layout.spacing.m,
    backgroundColor: Colors.lightGray,
    borderRadius: Layout.components.button.borderRadius.small,
  },
  questInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.s,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.xs,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedText,
    textTransform: "capitalize",
  },
  questStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: Layout.spacing.xs,
  },
  questText: {
    fontSize: 14,
    color: Colors.darkText,
    lineHeight: 20,
  },
});
