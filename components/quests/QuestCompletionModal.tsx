import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";

import { Button } from "@/components/common/Button";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { QuestFeedback } from "@/types/types";

interface QuestCompletionModalProps {
  visible: boolean;
  questText: string;
  onClose: () => void;
  onSubmit: (feedback: QuestFeedback) => void;
}

export const QuestCompletionModal: React.FC<QuestCompletionModalProps> = ({
  visible,
  questText,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<"thumbs_up" | "thumbs_down" | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert(
        "Rating Required",
        "Please select a thumbs up or thumbs down rating."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const feedback: QuestFeedback = {
        rating,
        comment: comment.trim() || undefined,
        completed: true,
        timeSpent: timeSpent ? parseInt(timeSpent, 10) : undefined,
      };

      await onSubmit(feedback);
      handleClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(null);
    setComment("");
    setTimeSpent("");
    onClose();
  };

  const handleRatingSelect = (selectedRating: "thumbs_up" | "thumbs_down") => {
    setRating(selectedRating);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Quest</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.darkText} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.questText}>{questText}</Text>

            <Text style={styles.sectionTitle}>How was this quest?</Text>
            <View style={styles.ratingContainer}>
              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  rating === "thumbs_down" && styles.ratingButtonSelected,
                ]}
                onPress={() => handleRatingSelect("thumbs_down")}
              >
                <Ionicons
                  name="thumbs-down"
                  size={32}
                  color={rating === "thumbs_down" ? Colors.white : Colors.error}
                />
                <Text
                  style={[
                    styles.ratingText,
                    rating === "thumbs_down" && styles.ratingTextSelected,
                  ]}
                >
                  Thumbs Down
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  rating === "thumbs_up" && styles.ratingButtonSelected,
                ]}
                onPress={() => handleRatingSelect("thumbs_up")}
              >
                <Ionicons
                  name="thumbs-up"
                  size={32}
                  color={rating === "thumbs_up" ? Colors.white : Colors.success}
                />
                <Text
                  style={[
                    styles.ratingText,
                    rating === "thumbs_up" && styles.ratingTextSelected,
                  ]}
                >
                  Thumbs Up
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Comments (Optional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Include details about the quest or share feedback on it"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.sectionTitle}>Time Spent (Optional)</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="Minutes"
              value={timeSpent}
              onChangeText={setTimeSpent}
              keyboardType="numeric"
            />
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={handleClose}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
            <Button
              title="Complete"
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                !rating && styles.submitButtonDisabled,
              ]}
              textStyle={styles.submitButtonText}
              disabled={!rating || isSubmitting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.darkText,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  questText: {
    fontSize: 16,
    color: Colors.darkText,
    marginBottom: 20,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkText,
    marginBottom: 12,
    marginTop: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  ratingButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 100,
  },
  ratingButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ratingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.darkText,
  },
  ratingTextSelected: {
    color: Colors.white,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.darkText,
    backgroundColor: Colors.lightGray,
    minHeight: 80,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.darkText,
    backgroundColor: Colors.lightGray,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  cancelButtonText: {
    color: Colors.darkText,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.mutedText,
  },
  submitButtonText: {
    color: Colors.white,
  },
});
