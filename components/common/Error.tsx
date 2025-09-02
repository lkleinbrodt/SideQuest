import { Text, View } from "react-native";

import { Button } from "./Button";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/Layout";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Error = ({
  text = "Something went wrong",
  subtext = "Please try again later",
  onRetry = () => {},
}: {
  text?: string;
  subtext?: string;
  onRetry?: () => void;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{text}</Text>
        <Text style={styles.errorSubtext}>{subtext}</Text>
        <Button
          title="Retry"
          onPress={onRetry}
          variant="outline"
          size="medium"
          style={styles.retryButton}
          icon={{
            name: "refresh",
            position: "left",
          }}
        />
      </View>
    </View>
  );
};

export default Error;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.xl,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.error,
    marginTop: Layout.spacing.m,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 16,
    color: Colors.mutedText,
    marginTop: Layout.spacing.xs,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Layout.spacing.m,
  },
});
