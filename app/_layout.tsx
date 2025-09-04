import "react-native-reanimated";

import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "@/auth/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { QuestProvider } from "@/context/QuestContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { notificationService } from "@/api/services/notificationService";
import { useColorScheme } from "@/components/useColorScheme";
import { useEffect } from "react";
import { useFonts } from "expo-font";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Change the initial route to our new loading gate
  initialRouteName: "index",
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

  useEffect(() => {
    // Set up notification listeners
    const notificationListener =
      notificationService.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        // Handle notification received while app is in foreground
        // You could show an in-app notification or update UI here
      });

    const responseListener =
      notificationService.addNotificationResponseListener((response) => {
        console.log("Notification response:", response);
        // Handle when user taps on notification
        // You could navigate to a specific screen here
        // For now, we'll just log it
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <AuthProvider>
          <QuestProvider>
            <OnboardingProvider>
              <Stack>
                {/* Add the new index screen to the stack */}
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                    animation: "fade",
                  }}
                />
              </Stack>
            </OnboardingProvider>
          </QuestProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
