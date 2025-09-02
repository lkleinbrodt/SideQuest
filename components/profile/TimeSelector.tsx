import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import React from "react";

const TIME_OPTIONS = [5, 10, 15, 20, 30];

export interface TimeSelectorProps {
  selectedTime: number;
  onTimeChange: (time: number) => void;
  compact?: boolean;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  onTimeChange,
  compact = false,
}) => {
  return (
    <View style={styles.timeContainer}>
      <Text style={[styles.timeValue, compact && styles.compactTimeValue]}>
        {selectedTime} minutes
      </Text>
      <View style={[styles.timeSlider, compact && styles.compactSlider]}>
        {TIME_OPTIONS.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeOption,
              compact && styles.compactTimeOption,
              selectedTime === time && styles.timeOptionSelected,
            ]}
            onPress={() => onTimeChange(time)}
          >
            <Text
              style={[
                styles.timeOptionText,
                compact && styles.compactTimeOptionText,
                selectedTime === time && styles.timeOptionTextSelected,
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timeContainer: {
    alignItems: "center",
  },
  timeValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 16,
  },
  compactTimeValue: {
    fontSize: 20,
    marginBottom: 12,
  },
  timeSlider: {
    flexDirection: "row",
    gap: 8,
  },
  compactSlider: {
    gap: 6,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  compactTimeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondary,
  },
  compactTimeOptionText: {
    fontSize: 12,
  },
  timeOptionTextSelected: {
    color: Colors.white,
  },
});
