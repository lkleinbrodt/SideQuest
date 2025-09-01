import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      {/* Auto-login screen - automatically handles anonymous authentication */}
      <Stack.Screen
        name="auto-login"
        options={{
          title: "SideQuest",
          headerShown: false,
        }}
      />

      {/* Onboarding flow - shown after successful authentication */}
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
        }}
      />

      {/* FUTURE ENHANCEMENT: Welcome screen can be re-enabled for Apple Sign-In choice */}
      {/* <Stack.Screen
        name="welcome"
        options={{
          title: "Welcome to SideQuest",
          headerShown: false,
        }}
      /> */}
    </Stack>
  );
}
