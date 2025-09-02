import * as Localization from "expo-localization";

/**
 * Gets the user's current timezone
 * @returns The user's timezone identifier (e.g., "America/New_York") or "UTC" as fallback
 */
export function getUserTimezone(): string {
  try {
    // Get timezone from calendar settings (guaranteed to have at least 1 element)
    const calendars = Localization.getCalendars();
    if (calendars.length > 0 && calendars[0]?.timeZone) {
      return calendars[0].timeZone;
    }

    // Final fallback
    return "UTC";
  } catch (error) {
    console.warn("Failed to get user timezone:", error);
    return "UTC";
  }
}

/**
 * Gets the user's current locale
 * @returns The user's locale identifier (e.g., "en-US") or "en" as fallback
 */
export function getUserLocale(): string {
  try {
    const locales = Localization.getLocales();
    if (locales.length > 0 && locales[0]?.languageTag) {
      return locales[0].languageTag;
    }
    return "en";
  } catch (error) {
    console.warn("Failed to get user locale:", error);
    return "en";
  }
}
