//must import this before uuid
import "react-native-get-random-values";

import * as SecureStore from "expo-secure-store";

import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "sidequest_device_id";

// Hardcoded device ID for development mode (simulator)
const DEV_DEVICE_ID = "5a5ed607-3d2e-4697-8d02-235b8b0041b7";

/**
 * Check if the app is running in development mode
 */
function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Get or create a device UUID for anonymous authentication
 * The UUID is stored in SecureStore and persists across app reinstalls
 * In development mode, returns a hardcoded ID for consistent testing
 */
export async function getOrCreateDeviceId(): Promise<string> {
  // In development mode, always return the hardcoded ID
  if (isDevelopmentMode()) {
    console.log("Development mode: using hardcoded device ID");
    return DEV_DEVICE_ID;
  }

  try {
    // Try to get existing device ID
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (!deviceId) {
      // Generate new UUID if none exists
      deviceId = uuidv4();

      // Store in SecureStore with secure options
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId, {
        keychainService: "sidequest.credentials",
      });
    }

    return deviceId;
  } catch (error) {
    console.error("Failed to get or create device ID:", error);
    // Fallback: generate new UUID (won't persist but allows app to work)
    return uuidv4();
  }
}

/**
 * Get the current device ID without creating a new one
 */
export async function getDeviceId(): Promise<string | null> {
  // In development mode, always return the hardcoded ID
  if (isDevelopmentMode()) {
    return DEV_DEVICE_ID;
  }

  try {
    return await SecureStore.getItemAsync(DEVICE_ID_KEY);
  } catch (error) {
    console.error("Failed to get device ID:", error);
    return null;
  }
}

/**
 * Clear the stored device ID (useful for testing or user logout)
 */
export async function clearDeviceId(): Promise<void> {
  // In development mode, this is a no-op since we use hardcoded ID
  if (isDevelopmentMode()) {
    console.log("Development mode: clearDeviceId is a no-op");
    return;
  }

  try {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
  } catch (error) {
    console.error("Failed to clear device ID:", error);
  }
}
