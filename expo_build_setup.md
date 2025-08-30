# AI Assistant Template for Expo React Native Mobile Apps

This template provides structured guidance for building modern mobile applications using React Native with the Expo framework and Expo Router for navigation. Follow this template to help me create consistent, well-architected mobile applications.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Folder Structure](#folder-structure)
3. [Navigation Setup](#navigation-setup)
4. [Authentication Implementation](#authentication-implementation)
5. [API Integration](#api-integration)
6. [Styling and Theming](#styling-and-theming)
7. [Common Components](#common-components)
8. [Testing and Deployment](#testing-and-deployment)

## Project Setup

Start by creating a new Expo application with the following command:

```bash
npx create-expo-app@latest ProjectName -t
```

Select the "Blank (TypeScript)" template when prompted.

After creation, navigate into the project directory:

```bash
cd ProjectName
```

Install required dependencies:

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar @expo/vector-icons
```

For authentication and storage:

```bash
npx expo install expo-secure-store expo-apple-authentication @react-native-community/netinfo
```

For API calls:

```bash
npm install apisauce jwt-decode
```

## Folder Structure

Follow this folder structure for all applications:

```
Root/
├── app/                       # Expo Router directory
│   ├── (app)/                 # Main app routes (authenticated routes)
│   │   ├── _layout.tsx        # Layout for main app screens
│   │   ├── index.tsx          # Home screen
│   │   └── [additional screens].tsx
│   ├── _layout.tsx            # Root layout
│   ├── welcome.tsx            # Welcome/login screen
│   └── +not-found.tsx         # 404 fallback screen
├── api/                       # API integration
│   ├── auth.ts                # Authentication service
│   ├── config.ts              # API configuration
│   ├── client.ts              # API client
│   └── [additional API services].ts
├── assets/                    # Static assets (images, fonts)
│   ├── images/
│   └── fonts/
├── auth/                      # Authentication modules
│   ├── storage.tsx            # Token storage
│   └── AuthContext.tsx        # Authentication context
├── components/                # Reusable components
│   ├── common/                # Basic UI components
│   ├── forms/                 # Form components
│   └── layout/                # Layout components
├── constants/                 # App constants
│   ├── Theme.ts               # Theme configuration
│   ├── Colors.ts              # Color palette
│   └── Layout.ts              # Layout constants
├── context/                   # React contexts
├── hooks/                     # Custom React hooks
└── utils/                     # Utility functions
```

## Navigation Setup

Expo Router uses a file-based routing system, similar to Next.js. The structure of your files in the `app/` directory defines your app's navigation.

### Root Layout (`app/_layout.tsx`)

The root layout is the entry point for your application and typically includes providers:

```tsx
import { Slot } from "expo-router";

import AppLoadingScreen from "@/components/layouts/AppLoadingScreen";
import { AuthProvider } from "@/auth/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreen } from "expo-router";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppLoadingScreen />
        <Slot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

Here's the app loading screen:

```
import { SplashScreen } from "expo-router";
import { useAuth } from "@/auth/AuthContext";
import { useEffect } from "react";
import { useLoadFonts } from "@/hooks/useLoadFonts";

export default function AppLoadingScreen() {
  const { loading: authLoading } = useAuth();
  const { fontsLoaded, fontError } = useLoadFonts();

  useEffect(() => {
    if (fontsLoaded && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  return null;
}
```

### Authentication Flow

Create a directory structure that supports authentication flow:

- `app/(auth)/_layout.tsx` - Layout for auth screens
- `app/(auth)/login.tsx` - Login screen
- `app/(app)/_layout.tsx` - Layout for main app (authenticated) screens
- `app/(app)/index.tsx` - Home screen

### Authenticated Layout (`app/(app)/_layout.tsx`)

Use this layout for your main app screens, typically with a tab navigator:

```tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/auth/AuthContext";
import { Redirect } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
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
        tabBarActiveTintColor: "#primary-color",
        headerStyle: {
          backgroundColor: "#background-color",
        },
        headerShadowVisible: false,
        headerTintColor: "#text-color",
        tabBarStyle: {
          backgroundColor: "#background-color",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
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
      {/* Add more tabs as needed */}
    </Tabs>
  );
}
```

### Welcome Screen

```tsx
import * as AppleAuthentication from "expo-apple-authentication";

import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    try {
      await signIn();
      router.replace("/");
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <LinearGradient
        colors={["#FFF8E8", "#FFFCF5"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/poppy-cartoon-no-bg.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>PoppyTracker</Text>
        <Text style={styles.subtitle}>This dog eats!!!</Text>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleSignIn}
          />
        )}

        <View style={styles.footer}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E8",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4A3728",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },
  subtitle: {
    fontSize: 17,
    color: "#6B5A4E",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },
  appleButton: {
    width: "100%",
    height: 50,
    marginBottom: 16,
  },
  footer: {
    position: "absolute",
    bottom: 32 + (Platform.OS === "ios" ? 0 : 16), // Adjust for Android
    left: 24,
    right: 24,
  },
  footerText: {
    fontSize: 13,
    color: "#6B5A4E",
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: "#A67B5B",
    textDecorationLine: "underline",
  },
});
```

### Not Found Screen

Create a `+not-found.tsx` file to handle undefined routes:

```tsx
import { View, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Link href="/" style={styles.button}>
          Go back to Home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#background-color",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    fontSize: 18,
    color: "#primary-color",
    textDecorationLine: "underline",
  },
});
```

## Authentication Implementation

### Authentication Context (`auth/AuthContext.tsx`)

Set up a context to manage authentication state:

```tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, authService } from "@/api/auth";
import { getUser, removeToken, storeToken } from "@/auth/storage";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to restore user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Sign in function
  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Authentication logic here...
      // Example with Apple authentication:
      const isAvailable = await authService.initializeAppleAuth();
      if (!isAvailable) {
        throw new Error("Authentication is not available");
      }

      const response = await authService.signInWithApple();
      await storeToken(response.access_token);

      const userData = jwtDecode(response.access_token) as UserProfile;
      setUser(userData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await removeToken();
      setUser(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

### Secure Storage (`auth/storage.tsx`)

Handle token storage securely:

```tsx
import * as SecureStore from "expo-secure-store";
import { UserProfile } from "@/api/auth";
import { jwtDecode } from "jwt-decode";

// Save data to secure storage
export const save = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

// Load data from secure storage
export const load = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

// Remove data from secure storage
export const remove = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key);
};

// Store authentication token
export const storeToken = async (authToken: string) => {
  try {
    await save("authToken", authToken);
  } catch (error) {
    console.log("Error storing the auth token", error);
  }
};

// Get stored authentication token
export const getToken = async () => {
  try {
    return await load("authToken");
  } catch (error) {
    console.log("Error getting the auth token", error);
    return null;
  }
};

// Remove authentication token
export const removeToken = async () => {
  try {
    await remove("authToken");
  } catch (error) {
    console.log("Error removing the auth token", error);
  }
};

// Get user data from token
export const getUser = async (): Promise<UserProfile | null> => {
  try {
    const token = await getToken();
    if (!token) return null;
    return jwtDecode(token) as UserProfile;
  } catch (error) {
    console.log("Error getting the user", error);
    return null;
  }
};
```

## API Integration

### API Configuration (`api/config.ts`)

Configure API endpoints for different environments:

```tsx
const API_CONFIG = {
  development: {
    baseURL: "http://localhost:5002/api",
    timeout: 30000,
  },
  staging: {
    baseURL: "https://staging-api.yourapp.com/api",
    timeout: 30000,
  },
  production: {
    baseURL: "https://api.yourapp.com/api",
    timeout: 30000,
  },
};

export const getApiConfig = () => {
  return (
    API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] ||
    API_CONFIG.development
  );
};
```

### API Client (`api/client.ts`)

Create a reusable API client with error handling:

```tsx
import { create } from "apisauce";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { getApiConfig } from "@/api/config";
import { getToken } from "@/auth/storage";

// Types
export interface APIResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

class APIClient {
  private static instance: APIClient;
  private api;
  private baseURL: string;

  private constructor() {
    const config = getApiConfig();
    this.baseURL = config.baseURL;

    this.api = create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private getUserAgent(): string {
    const appVersion = Constants.expoConfig?.version || "1.0.0";
    return `YourApp/${appVersion} (${Platform.OS}; ${Platform.Version})`;
  }

  private async setupInterceptors() {
    // Request interceptor for authentication and connectivity
    this.api.addRequestTransform(async (request) => {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        throw new Error("No internet connection");
      }

      const token = await getToken();
      if (token) {
        request.headers["Authorization"] = `Bearer ${token}`;
      }
    });
  }

  // HTTP methods with proper typing and error handling
  async get<T>(path: string): Promise<APIResponse<T>> {
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
      });

      const token = await getToken();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`${this.baseURL}${path}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  async post<T>(path: string, body?: any): Promise<APIResponse<T>> {
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
      });

      const token = await getToken();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      if (body instanceof FormData) {
        headers.delete("Content-Type");
      }

      const response = await fetch(`${this.baseURL}${path}`, {
        method: "POST",
        headers,
        body:
          body instanceof FormData
            ? body
            : body
            ? JSON.stringify(body)
            : undefined,
      });

      const data = await response.json();

      return {
        ok: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  // Add PUT, DELETE, etc. methods as needed
}

export const apiClient = APIClient.getInstance();
```

## Styling and Theming

### Theme Configuration (`constants/Theme.ts`)

Create a centralized theme:

```tsx
import { ColorSchemeName } from "react-native";
import { Colors } from "./Colors";

// Define theme type
export type ThemeType = {
  dark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    pill: number;
  };
  typography: {
    sizes: {
      xs: number;
      s: number;
      m: number;
      l: number;
      xl: number;
      xxl: number;
    };
    weights: {
      regular: string;
      medium: string;
      bold: string;
    };
  };
};

// Create theme settings for light and dark modes
const LightTheme: ThemeType = {
  dark: false,
  colors: {
    primary: Colors.primary,
    secondary: Colors.secondary,
    background: Colors.white,
    card: Colors.lightGray,
    text: Colors.darkText,
    border: Colors.border,
    notification: Colors.notification,
    error: Colors.error,
    success: Colors.success,
    warning: Colors.warning,
    info: Colors.info,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    pill: 999,
  },
  typography: {
    sizes: {
      xs: 12,
      s: 14,
      m: 16,
      l: 18,
      xl: 20,
      xxl: 24,
    },
    weights: {
      regular: "400",
      medium: "600",
      bold: "700",
    },
  },
};

const DarkTheme: ThemeType = {
  ...LightTheme,
  dark: true,
  colors: {
    ...LightTheme.colors,
    background: Colors.darkBackground,
    card: Colors.darkGray,
    text: Colors.lightText,
    border: Colors.darkBorder,
  },
};

export const getTheme = (colorScheme: ColorSchemeName): ThemeType => {
  return colorScheme === "dark" ? DarkTheme : LightTheme;
};
```

### Color Palette (`constants/Colors.ts`)

Define your app's color palette:

```tsx
export const Colors = {
  // Primary colors
  primary: "#4A3728",
  secondary: "#A67B5B",

  // Backgrounds
  white: "#FFFFFF",
  lightGray: "#F5F5F5",
  darkBackground: "#121212",
  darkGray: "#2C2C2C",

  // Text
  darkText: "#333333",
  lightText: "#FFFFFF",

  // UI elements
  border: "#E0E0E0",
  darkBorder: "#444444",
  notification: "#FF3B30",

  // Status colors
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FFCC00",
  info: "#007AFF",

  // Additional colors as needed
  accent1: "#FFD33D",
  accent2: "#FFF8E8",
};
```

## Common Components

Create reusable components for your application. For example:

### Button Component (`components/common/Button.tsx`)

```tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { Colors } from "@/constants/Colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.lightGray;
    switch (variant) {
      case "primary":
        return Colors.primary;
      case "secondary":
        return Colors.secondary;
      case "outline":
        return "transparent";
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.darkGray;
    switch (variant) {
      case "primary":
      case "secondary":
        return Colors.white;
      case "outline":
        return Colors.primary;
      default:
        return Colors.white;
    }
  };

  const getBorderColor = () => {
    if (disabled) return Colors.lightGray;
    switch (variant) {
      case "outline":
        return Colors.primary;
      default:
        return "transparent";
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case "medium":
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case "large":
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          ...getPadding(),
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
```

## Testing and Deployment

### Setting Up Testing

Install testing libraries:

```bash
npm install --save-dev jest @testing-library/react-native
```

### Configuring for Deployment

Update `app.json` with the necessary configurations:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.yourapp"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": ["expo-router"]
  }
}
```

### Build Commands

Build for iOS:

```bash
eas build --platform ios
```

Build for Android:

```bash
eas build --platform android
```

For development builds:

```bash
eas build --profile development --platform ios
```

## Best Practices Checklist

When implementing a new app:

1. ✅ Start with the proper project setup and folder structure
2. ✅ Configure navigation with Expo Router
3. ✅ Implement authentication flow
4. ✅ Set up API integration with proper error handling
5. ✅ Create a consistent theme across the app
6. ✅ Build reusable components
7. ✅ Test thoroughly on multiple devices
8. ✅ Configure for deployment
