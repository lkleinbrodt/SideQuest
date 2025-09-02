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
          <Image
            source={require("@/assets/raccoon.png")}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Welcome to SideQuest!</Text>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Image
              source={require("@/assets/category-badges/outdoors_1_transparent.png")}
              style={styles.featureIcon}
              resizeMode="contain"
            />
            <Text style={styles.featureText}>
              Get daily, personalized quests
            </Text>
          </View>
          <View style={styles.feature}>
            <Image
              source={require("@/assets/category-badges/hobbies_1_transparent.png")}
              style={styles.featureIcon}
              resizeMode="contain"
            />
            <Text style={styles.featureText}>
              Accept what you like, skip what you don't
            </Text>
          </View>
          <View style={styles.feature}>
            <Image
              source={require("@/assets/category-badges/mindfulness_1_transparent.png")}
              style={styles.featureIcon}
              resizeMode="contain"
            />
            <Text style={styles.featureText}>
              Earn points for each quest you complete
            </Text>
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
    width: 240,
    height: 240,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logo: {
    width: "100%",
    height: "100%",
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
  },
  featureIcon: {
    width: 82,
    height: 82,
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
