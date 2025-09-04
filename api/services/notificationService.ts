import * as Notifications from "expo-notifications";

import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification service
   * This should be called when the app starts
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Notification permissions not granted");
        return;
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("daily-quests", {
          name: "Daily Quest Reminders",
          description: "Notifications for your daily quests",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B6B",
        });
      }

      this.isInitialized = true;
      console.log("Notification service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize notification service:", error);
    }
  }

  /**
   * Schedule daily quest notification
   */
  async scheduleDailyNotification(time: string): Promise<void> {
    try {
      // Cancel any existing daily notifications
      await this.cancelDailyNotifications();

      // Parse time (format: "HH:MM")
      const [hours, minutes] = time.split(":").map(Number);

      // Create trigger for daily notification
      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      };

      // Schedule the notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Your Daily Quests Are Ready! 🎯",
          body: "Check out your personalized quests for today",
          sound: "default",
          data: { type: "daily_quests" },
        },
        trigger,
      });

      console.log(`Daily notification scheduled for ${time}`);
    } catch (error) {
      console.error("Failed to schedule daily notification:", error);
    }
  }

  /**
   * Cancel all daily quest notifications
   */
  async cancelDailyNotifications(): Promise<void> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      // Find and cancel daily quest notifications
      const dailyQuestNotifications = scheduledNotifications.filter(
        (notification) => notification.content.data?.type === "daily_quests"
      );

      for (const notification of dailyQuestNotifications) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }

      console.log(
        `Cancelled ${dailyQuestNotifications.length} daily quest notifications`
      );
    } catch (error) {
      console.error("Failed to cancel daily notifications:", error);
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    settings: NotificationSettings
  ): Promise<void> {
    try {
      if (settings.enabled) {
        await this.scheduleDailyNotification(settings.time);
      } else {
        await this.cancelDailyNotifications();
      }
    } catch (error) {
      console.error("Failed to update notification settings:", error);
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to check notification permissions:", error);
      return false;
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to get scheduled notifications:", error);
      return [];
    }
  }

  /**
   * Send a test notification immediately
   */
  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification 🧪",
          body: "This is a test notification from SideQuest",
          sound: "default",
          data: { type: "test" },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Failed to send test notification:", error);
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Handle notification received while app is in foreground
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }
}

export const notificationService = NotificationService.getInstance();
