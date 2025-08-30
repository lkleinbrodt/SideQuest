import { Image, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboarding } from "@/context/OnboardingContext";

export const OnboardingWelcome: React.FC = () => {
  const { nextStep } = useOnboarding();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎯</Text>
        </View>

        <Text style={styles.title}>Welcome to SideQuest!</Text>
        <Text style={styles.subtitle}>Your daily micro-adventures await</Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Every morning, you'll receive three personalized quests designed to
            add novelty, productivity, and joy to your day — without guilt or
            pressure.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✨</Text>
            <Text style={styles.featureText}>Personalized for you</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Quick & achievable</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🌅</Text>
            <Text style={styles.featureText}>Fresh every morning</Text>
          </View>
        </View>

        <Button
          title="Get Started"
          onPress={nextStep}
          size="large"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.questCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logo: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  descriptionContainer: {
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: "center",
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 48,
    width: "100%",
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: Colors.secondary,
    flex: 1,
  },
  button: {
    width: "100%",
  },
});
