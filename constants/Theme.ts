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
