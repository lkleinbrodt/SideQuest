import { StyleSheet, View } from "react-native";

import { Bounce } from "react-native-animated-spinkit";
import { Colors } from "@/constants/Colors";
import React from "react";

export const RefreshSpinner: React.FC = () => {
  return (
    <View style={styles.container}>
      <Bounce size={24} color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
