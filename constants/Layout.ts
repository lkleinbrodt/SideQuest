import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const Layout = {
  // Screen dimensions
  window: {
    width,
    height,
  },

  // Breakpoints for responsive design
  breakpoints: {
    small: 375,
    medium: 768,
    large: 1024,
  },

  // Standard spacing values
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  // Component dimensions
  components: {
    button: {
      height: {
        small: 32,
        medium: 44,
        large: 56,
      },
      borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
      },
    },
    card: {
      borderRadius: 12,
      padding: 16,
      margin: 8,
    },
    input: {
      height: 44,
      borderRadius: 8,
      paddingHorizontal: 16,
    },
  },

  // Navigation
  navigation: {
    headerHeight: 56,
    tabBarHeight: 83,
    bottomSafeArea: 34,
  },

  // Quest card dimensions
  questCard: {
    width: width - 32, // Full width minus margins
    height: 200,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },

  // Grid layouts
  grid: {
    columns: {
      small: 1,
      medium: 2,
      large: 3,
    },
    gap: 16,
  },

  // Z-index values
  zIndex: {
    base: 0,
    card: 1,
    modal: 10,
    overlay: 100,
    tooltip: 1000,
  },
};
