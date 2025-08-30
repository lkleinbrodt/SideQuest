import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="welcome"
        options={{
          title: "Welcome to SideQuest",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
