import * as SecureStore from "expo-secure-store";

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

// Store user data
export const storeUser = async (userData: string) => {
  try {
    await save("userData", userData);
  } catch (error) {
    console.log("Error storing user data", error);
  }
};

// Get stored user data
export const getUser = async () => {
  try {
    return await load("userData");
  } catch (error) {
    console.log("Error getting user data", error);
    return null;
  }
};

// Remove user data
export const removeUser = async () => {
  try {
    await remove("userData");
  } catch (error) {
    console.log("Error removing user data", error);
  }
};
