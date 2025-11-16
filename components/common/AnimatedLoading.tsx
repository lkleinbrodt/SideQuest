import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";

import { Bounce } from "react-native-animated-spinkit";
import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";

const { width: screenWidth } = Dimensions.get("window");

interface AnimatedLoadingProps {
  showProgress?: boolean;
}

export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({}) => {
  // Loading messages that cycle through
  const loadingMessages = [
    "Generating new quests for you...",
    "Gathering adventures...",
    "Preparing quests...",
    "Almost ready...",
    "Final touches...",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const cycleThrough = false;

  useEffect(() => {
    // Cycle through loading messages,
    // TODO: if cycleThrough is false, stop cycling once you reach the last message

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 5000);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Main loading content */}
      <View style={styles.mainContent}>
        {/* Central spinning animation */}
        <View style={styles.spinnerContainer}>
          <Bounce size={80} color={Colors.primary} />
        </View>

        {/* Loading text */}
        <View style={styles.textContainer}>
          <Text style={styles.loadingText}>
            {loadingMessages[currentMessageIndex]}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  mainContent: {
    alignItems: "center",
  },
  spinnerContainer: {
    marginBottom: Layout.spacing.xl,
  },
  textContainer: {
    marginBottom: Layout.spacing.l,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Layout.spacing.s,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: "center",
  },
});
