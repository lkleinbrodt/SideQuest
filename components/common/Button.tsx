import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import React from "react";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    position?: "left" | "right";
  };
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.lightGray;
    switch (variant) {
      case "primary":
        return Colors.primary;
      case "secondary":
        return Colors.secondary;
      case "success":
        return Colors.success;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.mutedText;
    switch (variant) {
      case "primary":
      case "secondary":
      case "success":
        return Colors.white;
      case "outline":
        return Colors.primary;
      case "ghost":
        return Colors.primary;
      default:
        return Colors.white;
    }
  };

  const getBorderColor = () => {
    if (disabled) return Colors.lightGray;
    switch (variant) {
      case "outline":
        return Colors.primary;
      case "ghost":
        return "transparent";
      default:
        return "transparent";
    }
  };

  const getBorderWidth = () => {
    switch (variant) {
      case "outline":
        return 1;
      default:
        return 0;
    }
  };

  const getHeight = () => {
    switch (size) {
      case "small":
        return Layout.components.button.height.small;
      case "medium":
        return Layout.components.button.height.medium;
      case "large":
        return Layout.components.button.height.large;
      default:
        return Layout.components.button.height.medium;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case "medium":
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case "large":
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "medium":
        return 16;
      case "large":
        return 18;
      default:
        return 16;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "medium":
        return 18;
      case "large":
        return 20;
      default:
        return 18;
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextColor()} />;
    }

    const iconSize = icon?.size || getIconSize();
    const iconColor = getTextColor();

    if (icon) {
      const iconElement = (
        <Ionicons name={icon.name} size={iconSize} color={iconColor} />
      );

      if (icon.position === "right") {
        return (
          <View style={styles.contentContainer}>
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: getFontSize(),
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {iconElement}
          </View>
        );
      } else {
        // Default to left position
        return (
          <View style={styles.contentContainer}>
            {iconElement}
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: getFontSize(),
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        );
      }
    }

    return (
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: getFontSize(),
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: getBorderWidth(),
          height: getHeight(),
          ...getPadding(),
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Layout.components.button.borderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
});
