import { StyleSheet, Text, TextInput, View } from "react-native";

import { Colors } from "@/constants/Colors";
import React from "react";

export interface AdditionalNotesInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  compact?: boolean;
  placeholder?: string;
}

export const AdditionalNotesInput: React.FC<AdditionalNotesInputProps> = ({
  value,
  onChange,
  onBlur,
  compact = false,
  placeholder = "Any specific preferences, interests, or notes about your quests...",
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.textInput, compact && styles.compactTextInput]}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={Colors.mutedText}
        multiline
        numberOfLines={compact ? 3 : 4}
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  textInput: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.primary,
    backgroundColor: Colors.white,
    minHeight: 100,
  },
  compactTextInput: {
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
});
