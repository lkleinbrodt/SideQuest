import "react-native-reanimated";

import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "@/auth/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { QuestProvider } from "@/context/QuestContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { useEffect } from "react";
import { useFonts } from "expo-font";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  // Note: Changed from (tabs) to (auth) since we now auto-login on app boot
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Note: We don't hide the splash screen here anymore
  // The auto-login component will handle hiding it after authentication is complete
  // This ensures the splash screen stays visible during the anonymous login process

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QuestProvider>
          <OnboardingProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  animation: "fade",
                  headerBackTitle: "Back",
                }}
              />
            </Stack>
          </OnboardingProvider>
        </QuestProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
