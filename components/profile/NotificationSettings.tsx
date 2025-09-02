import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import React from "react";

const NOTIFICATION_TIMES = [
  { label: "7:00 AM", value: "07:00" },
  { label: "8:00 AM", value: "08:00" },
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
];

export interface NotificationSettingsProps {
  notificationsEnabled: boolean;
  notificationTime: string;
  onNotificationsChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  compact?: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notificationsEnabled,
  notificationTime,
  onNotificationsChange,
  onTimeChange,
  compact = false,
}) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.settingRow, compact && styles.compactSettingRow]}>
        <View style={styles.settingInfo}>
          <Text
            style={[styles.settingTitle, compact && styles.compactSettingTitle]}
          >
            Daily Quest Reminders
          </Text>
          <Text
            style={[
              styles.settingDescription,
              compact && styles.compactSettingDescription,
            ]}
          >
            Don't miss out on your daily quests!
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={onNotificationsChange}
          trackColor={{ false: Colors.border, true: Colors.primary + "40" }}
          thumbColor={notificationsEnabled ? Colors.primary : Colors.mutedText}
        />
      </View>

      {notificationsEnabled && (
        <View
          style={[styles.timeSection, compact && styles.compactTimeSection]}
        >
          <Text style={[styles.timeLabel, compact && styles.compactTimeLabel]}>
            Notification Time
          </Text>
          <View
            style={[styles.timeOptions, compact && styles.compactTimeOptions]}
          >
            {NOTIFICATION_TIMES.map((time) => (
              <TouchableOpacity
                key={time.value}
                style={[
                  styles.timeOption,
                  compact && styles.compactTimeOption,
                  notificationTime === time.value && styles.timeOptionSelected,
                ]}
                onPress={() => onTimeChange(time.value)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    compact && styles.compactTimeOptionText,
                    notificationTime === time.value &&
                      styles.timeOptionTextSelected,
                  ]}
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  compactSettingRow: {
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 4,
  },
  compactSettingTitle: {
    fontSize: 14,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.mutedText,
    lineHeight: 20,
  },
  compactSettingDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  timeSection: {
    marginTop: 16,
  },
  compactTimeSection: {
    marginTop: 12,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 12,
  },
  compactTimeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  compactTimeOptions: {
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
