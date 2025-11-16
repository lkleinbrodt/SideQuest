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

import { AnimatedLoading } from "@/components/common/AnimatedLoading";
import { Colors } from "@/constants/Colors";
import Error from "@/components/common/Error";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import { QuestCard } from "@/components/quests/QuestCard";
import { QuestFeedback } from "@/types/types";
import { RefreshSpinner } from "@/components/common/RefreshSpinner";
import { useQuest } from "@/context/QuestContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "potential" | "active";

const { width: screenWidth } = Dimensions.get("window");

export default function QuestBoardScreen() {
  const insets = useSafeAreaInsets();
  const { state, loadQuestBoard, updateQuestStatus } = useQuest();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("potential");
  const scrollViewRef = useRef<ScrollView>(null);

  // Load quest board on component mount
  useEffect(() => {
    console.log("QuestBoard screen mounted, loading quest board...");
    loadQuestBoard();
  }, []);

  // Handle quest acceptance
  const handleQuestAccept = async (questId: string) => {
    await updateQuestStatus(questId, "accepted");
  };

  // Handle quest completion
  const handleQuestComplete = async (
    questId: string,
    feedback: QuestFeedback
  ) => {
    await updateQuestStatus(questId, "completed", feedback);
  };

  // Handle quest abandonment
  const handleQuestAbandon = async (questId: string) => {
    await updateQuestStatus(questId, "abandoned");
  };

  // Handle quest decline
  const handleQuestDecline = async (questId: string) => {
    await updateQuestStatus(questId, "declined");
  };

  // Handle refresh
  const handleRefresh = async () => {
    //the load board will refresh if necesssary and top up if necessary
    setRefreshing(true);
    await loadQuestBoard();
    setRefreshing(false);
  };

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

  // Get quests by status
  const getPotentialQuests = () => {
    return state.questBoard.filter((q) => q.status === "potential");
  };

  const getActiveQuests = () => {
    return state.questBoard.filter(
      (q) =>
        q.status === "accepted" ||
        q.status === "completed" ||
        q.status === "abandoned"
    );
  };

  const getStatsText = () => {
    const potential = getPotentialQuests().length;
    const active = getActiveQuests().length;
    const total = state.questBoard.length;

    if (total === 0) return "No quests available";
    if (active === 0) return `${potential} potential quests available`;

    return `${potential} potential • ${active} active`;
  };

  if (state.isLoading && state.questBoard.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AnimatedLoading showProgress={true} />
      </View>
    );
  }

  if (refreshing && getPotentialQuests().length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AnimatedLoading showProgress={true} />
      </View>
    );
  }

  if (state.error && state.questBoard.length === 0) {
    return <Error subtext={state.error} onRetry={loadQuestBoard} />;
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
                tintColor={Colors.primary}
                colors={[Colors.primary]}
                progressViewOffset={0}
                progressBackgroundColor={Colors.white}
              />
            }
          >
            <View style={styles.questsContainer}>
              {getPotentialQuests().length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="compass" size={48} color={Colors.mutedText} />
                  <Text style={styles.emptyText}>
                    {state.error
                      ? "Failed to load quests"
                      : "No potential quests available"}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {state.error
                      ? "There was a problem loading your quest board"
                      : "Pull down to refresh or check back later"}
                  </Text>
                  {state.error && (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={loadQuestBoard}
                    >
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                getPotentialQuests().map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onAccept={() => handleQuestAccept(quest.id)}
                    onDecline={() => handleQuestDecline(quest.id)}
                    onComplete={handleQuestComplete}
                    onAbandon={() => handleQuestAbandon(quest.id)}
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
                tintColor={Colors.primary}
                colors={[Colors.primary]}
                progressViewOffset={0}
                progressBackgroundColor={Colors.white}
              />
            }
          >
            <View style={styles.questsContainer}>
              {getActiveQuests().length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={48}
                    color={Colors.mutedText}
                  />
                  <Text style={styles.emptyText}>
                    {state.error ? "Failed to load quests" : "No active quests"}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {state.error
                      ? "There was a problem loading your quest board"
                      : "Accept quests from the potential tab to get started"}
                  </Text>
                  {state.error && (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={loadQuestBoard}
                    >
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                getActiveQuests().map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onAccept={() => handleQuestAccept(quest.id)}
                    onDecline={() => handleQuestDecline(quest.id)}
                    onComplete={handleQuestComplete}
                    onAbandon={() => handleQuestAbandon(quest.id)}
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
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
    paddingBottom: Layout.spacing.xs,
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
  retryButton: {
    marginTop: Layout.spacing.m,
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.l,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
