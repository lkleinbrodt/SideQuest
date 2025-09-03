import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      {/* The auto-login screen is removed */}
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
