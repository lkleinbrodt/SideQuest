import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AnimatedLoading } from "@/components/common/AnimatedLoading";
import { Card } from "@/components/common/Card";
import { Colors } from "@/constants/Colors";
import { Error } from "@/components/common/Error";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import { questService } from "@/api/services/questService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HistoryStats {
  streak: number;
  successRate: number;
  mostCompletedCategory: string | null;
  topTags: Array<{ tag: string; count: number }>;
  totalCompleted: number;
  totalAccepted: number;
}

interface DayHistory {
  date: string;
  quests: Array<{
    id: string;
    text: string;
    category: string | null;
    completed: boolean;
    skipped: boolean;
  }>;
  completedCount: number;
  totalCount: number;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      const [statsData, historyData] = await Promise.all([
        questService.getHistoryStats(),
        questService.get7DayHistory(),
      ]);

      setStats(statsData);
      setHistory(historyData.history);
    } catch (err: any) {
      console.error("Error loading history data:", err);
      setError(err.message || "Failed to load history data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AnimatedLoading />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Error text={error} onRetry={loadData} />
      </View>
    );
  }

  // Show no history message if there's no data at all
  if (
    !loading &&
    (!stats || (stats.totalCompleted === 0 && history.length === 0))
  ) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>Quest History</Text>
            <Text style={styles.subtitle}>Track your daily adventures</Text>
          </View>

          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Ionicons
                name="time-outline"
                size={64}
                color={Colors.mutedText}
              />
            </View>
            <Text style={styles.emptyStateTitle}>No History Yet</Text>
            <Text style={styles.emptyStateMessage}>
              Complete some quests to start building your adventure history!
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Quest History</Text>
          <Text style={styles.subtitle}>Track your daily adventures</Text>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <Card variant="outlined" style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.streak}</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.successRate}%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.totalCompleted}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {stats && (stats.mostCompletedCategory || stats.topTags.length > 0) && (
          <View style={styles.additionalStatsContainer}>
            {stats.mostCompletedCategory && (
              <Card variant="outlined" style={styles.additionalStatsCard}>
                <View style={styles.additionalStatItem}>
                  <Ionicons name="trophy" size={20} color={Colors.primary} />
                  <View style={styles.additionalStatText}>
                    <Text style={styles.additionalStatLabel}>
                      Most Completed Category
                    </Text>
                    <Text style={styles.additionalStatValue}>
                      {stats.mostCompletedCategory.charAt(0).toUpperCase() +
                        stats.mostCompletedCategory.slice(1)}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {stats.topTags.length > 0 && (
              <Card variant="outlined" style={styles.additionalStatsCard}>
                <Text style={styles.topTagsTitle}>Top Tags</Text>
                <View style={styles.topTagsContainer}>
                  {stats.topTags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tagItem}>
                      <Text style={styles.tagText}>{tag.tag}</Text>
                      <Text style={styles.tagCount}>({tag.count})</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </View>
        )}

        <View style={styles.historyContainer}>
          {history.map((day, index) => (
            <Card key={index} variant="default" style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                {day.quests.length > 0 && (
                  <View style={styles.dayStats}>
                    <Text style={styles.dayStatsText}>
                      {day.completedCount}/{day.totalCount} completed
                    </Text>
                  </View>
                )}
              </View>

              {day.quests.length > 0 ? (
                <View style={styles.questsList}>
                  {day.quests.map((quest) => (
                    <View key={quest.id} style={styles.questItem}>
                      <View style={styles.questInfo}>
                        {quest.category && (
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
                        )}

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
              ) : (
                <View style={styles.emptyDayContainer}>
                  <Ionicons
                    name="sad-outline"
                    size={25}
                    color={Colors.mutedText}
                  />
                  <Text style={styles.emptyDayText}>no quests accepted</Text>
                </View>
              )}
            </Card>
          ))}
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
  additionalStatsContainer: {
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.l,
    gap: Layout.spacing.m,
  },
  additionalStatsCard: {
    padding: Layout.spacing.l,
  },
  additionalStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  additionalStatText: {
    marginLeft: Layout.spacing.m,
    flex: 1,
  },
  additionalStatLabel: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: Layout.spacing.xs,
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  topTagsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: Layout.spacing.m,
  },
  topTagsContainer: {
    gap: Layout.spacing.s,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagText: {
    fontSize: 14,
    color: Colors.darkText,
    fontWeight: "500",
  },
  tagCount: {
    fontSize: 12,
    color: Colors.mutedText,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.xxl,
  },
  emptyStateIcon: {
    marginBottom: Layout.spacing.l,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: Layout.spacing.m,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyDayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Layout.spacing.l,
    gap: Layout.spacing.s,
  },
  emptyDayText: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: "center",
    fontStyle: "italic",
  },
});
