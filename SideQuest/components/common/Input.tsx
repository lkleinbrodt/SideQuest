import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import React from "react";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, inputStyle, style, error && styles.inputError]}
        placeholderTextColor={Colors.mutedText}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.m,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkText,
    marginBottom: Layout.spacing.xs,
  },
  input: {
    height: Layout.components.input.height,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.components.input.borderRadius,
    paddingHorizontal: Layout.components.input.paddingHorizontal,
    fontSize: 16,
    color: Colors.darkText,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginTop: Layout.spacing.xs,
  },
});
