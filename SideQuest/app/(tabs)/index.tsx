import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import { QuestCard } from "@/components/quests/QuestCard";
import { QuestFeedback } from "@/types/quest";
import { useQuest } from "@/context/QuestContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "active" | "potential";

const { width: screenWidth } = Dimensions.get("window");

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const {
    state,
    generateDailyQuests,
    selectQuest,
    deselectQuest,
    completeQuest,
    skipQuest,
    refreshQuests,
  } = useQuest();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("potential");
  const scrollViewRef = useRef<ScrollView>(null);

  // Load quests on component mount
  useEffect(() => {
    console.log("Today screen mounted, checking quests...");
    if (state.todayQuests.length === 0) {
      console.log("No quests found, generating...");
      generateDailyQuests();
    } else {
      console.log(`Found ${state.todayQuests.length} existing quests`);
    }
  }, []);

  // Handle quest selection
  const handleQuestSelect = (questId: string) => {
    const quest = state.todayQuests.find((q) => q.id === questId);
    if (quest?.selected) {
      deselectQuest(questId);
    } else {
      selectQuest(questId);
    }
  };

  // Handle quest completion
  const handleQuestComplete = async (questId: string) => {
    // This will be called by QuestCard with feedback
  };

  // Handle quest skip
  const handleQuestSkip = async (questId: string) => {
    // This will be called by QuestCard with feedback
  };

  // Handle quest feedback
  const handleQuestFeedback = async (
    questId: string,
    feedback: QuestFeedback
  ) => {
    if (feedback.completed) {
      await completeQuest(questId, feedback);
    } else {
      await skipQuest(questId, feedback);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshQuests();
    setRefreshing(false);
  };

  // Check if it's a new day and we need fresh quests
  const shouldRefreshQuests = () => {
    if (!state.lastUpdated) return true;

    const now = new Date();
    const lastUpdate = new Date(state.lastUpdated);
    const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 1000)); // Convert to days

    return diffDays >= 1;
  };

  // Auto-refresh quests if it's a new day - only run once on mount
  useEffect(() => {
    const checkAndRefresh = async () => {
      if (shouldRefreshQuests()) {
        await generateDailyQuests();
      }
    };

    checkAndRefresh();
  }, []); // Empty dependency array - only run on mount

  // Handle tab change with scroll
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const xOffset = tab === "active" ? screenWidth : 0;
    scrollViewRef.current?.scrollTo({ x: xOffset, animated: true });
  };

  // Handle scroll end to update active tab
  const handleScrollEnd = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const newTab: TabType = xOffset >= screenWidth / 2 ? "active" : "potential";
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const getStatsText = () => {
    const selected = state.selectedQuests.length;
    const total = state.todayQuests.length;
    const completed = state.completedQuests.length;
    const skipped = state.skippedQuests.length;

    if (total === 0) return "No quests available";
    if (completed === total) return "All quests completed! 🎉";
    if (skipped === total) return "All quests skipped";

    let text = `${selected} of ${total} quests selected`;
    if (completed > 0) text += ` • ${completed} completed`;
    if (skipped > 0) text += ` • ${skipped} skipped`;

    return text;
  };

  if (state.isLoading && state.todayQuests.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color={Colors.primary} />
          <Text style={styles.loadingText}>
            Generating your daily quests...
          </Text>
        </View>
      </View>
    );
  }

  if (state.error && state.todayQuests.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>{state.error}</Text>
          <Text style={styles.retryText} onPress={generateDailyQuests}>
            Tap to retry
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Quest Board</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "potential" && styles.activeTab]}
          onPress={() => handleTabChange("potential")}
        >
          <Ionicons name="compass" size={20} color={Colors.primary} />
          <Text
            style={[
              styles.tabText,
              activeTab === "potential" && styles.activeTabText,
            ]}
          >
            Potential
          </Text>
          {/* <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>
              {
                state.todayQuests.filter(
                  (q) => !q.selected && !q.completed && !q.skipped
                ).length
              }
            </Text>
          </View> */}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => handleTabChange("active")}
        >
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active
          </Text>
          {/* <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>
              {
                state.todayQuests.filter((q) => q.selected || q.completed)
                  .length
              }
            </Text>
          </View> */}
        </TouchableOpacity>
      </View>

      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.swipeContainer}
        contentContainerStyle={styles.swipeContent}
      >
        {/* Potential Quests Tab */}
        <View style={styles.tabContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <View style={styles.questsContainer}>
              {state.todayQuests.filter(
                (q) => !q.selected && !q.completed && !q.skipped
              ).length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="compass" size={48} color={Colors.mutedText} />
                  <Text style={styles.emptyText}>
                    No potential quests available
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Pull down to refresh or check back later
                  </Text>
                </View>
              ) : (
                state.todayQuests
                  .filter((q) => !q.selected && !q.completed && !q.skipped)
                  .map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onSelect={handleQuestSelect}
                      onComplete={handleQuestComplete}
                      onSkip={handleQuestSkip}
                      onFeedback={handleQuestFeedback}
                      showActions={true}
                    />
                  ))
              )}
            </View>
          </ScrollView>
        </View>

        {/* Active Quests Tab */}
        <View style={styles.tabContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <View style={styles.questsContainer}>
              {state.todayQuests.filter((q) => q.selected || q.completed)
                .length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={48}
                    color={Colors.mutedText}
                  />
                  <Text style={styles.emptyText}>No active quests</Text>
                  <Text style={styles.emptySubtext}>
                    Select quests from the potential tab to get started
                  </Text>
                </View>
              ) : (
                state.todayQuests
                  .filter((q) => q.selected || q.completed)
                  .map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onSelect={handleQuestSelect}
                      onComplete={handleQuestComplete}
                      onSkip={handleQuestSkip}
                      onFeedback={handleQuestFeedback}
                      showActions={true}
                    />
                  ))
              )}
            </View>
          </ScrollView>
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
    // marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: "center",
    marginBottom: Layout.spacing.s,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.mutedText,
    textAlign: "center",
  },
  questsContainer: {
    paddingHorizontal: Layout.spacing.m,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.xl,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.mutedText,
    marginTop: Layout.spacing.m,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.xl,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.error,
    marginTop: Layout.spacing.m,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 16,
    color: Colors.mutedText,
    marginTop: Layout.spacing.xs,
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: Layout.spacing.m,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  emptyContainer: {
    padding: Layout.spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.mutedText,
    marginTop: Layout.spacing.m,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.mutedText,
    marginTop: Layout.spacing.xs,
    textAlign: "center",
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    // backgroundColor: Colors.lightGray,
    // paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: {
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: Layout.spacing.xs,
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  activeTabIcon: {
    color: Colors.primary,
  },
  tabBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabBadge: {},
  tabBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  swipeContainer: {
    flex: 1,
  },
  swipeContent: {
    width: screenWidth * 2, // Two tabs
  },
  tabContent: {
    width: screenWidth,
  },
});
