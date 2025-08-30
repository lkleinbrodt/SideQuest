import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  style?: StyleProp<ViewStyle>;
  padding?: "none" | "small" | "medium" | "large";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  style,
  padding = "medium",
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case "elevated":
        return styles.elevated;
      case "outlined":
        return styles.outlined;
      default:
        return styles.default;
    }
  };

  const getPadding = () => {
    switch (padding) {
      case "none":
        return 0;
      case "small":
        return Layout.spacing.s;
      case "medium":
        return Layout.spacing.m;
      case "large":
        return Layout.spacing.l;
      default:
        return Layout.spacing.m;
    }
  };

  return (
    <View
      style={[
        styles.card,
        getCardStyle(),
        {
          padding: getPadding(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Layout.components.card.borderRadius,
    margin: Layout.components.card.margin,
  },
  default: {
    shadowColor: Colors.darkText,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  elevated: {
    shadowColor: Colors.darkText,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
