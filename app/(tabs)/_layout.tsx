import { Redirect, Tabs } from "expo-router";

import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useAuth } from "@/auth/AuthContext";

export default function TabLayout() {
  const { user, onboardingComplete, loading } = useAuth();

  if (loading) {
    // While checking auth state, render nothing to avoid screen flicker
    return null;
  }

  // If there is no user OR if onboarding is not complete, redirect.
  if (!user || !onboardingComplete) {
    // Redirect to the root loading gate, which will correctly route
    // the user to the onboarding flow.
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "sunny" : "sunny-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vote"
        options={{
          title: "Vote",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "thumbs-up" : "thumbs-up-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
