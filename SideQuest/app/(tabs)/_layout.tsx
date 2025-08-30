import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/auth/AuthContext';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const { user, loading } = useAuth();

  // Redirect to welcome screen if not authenticated
  if (loading) {
    return null;
  }
  
  if (!user) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.primary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
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
          title: 'History',
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
        name="profile"
        options={{
          title: 'Profile',
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
