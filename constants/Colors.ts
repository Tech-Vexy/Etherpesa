/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Modern color scheme inspired by fintech applications like M-Pesa.
 */

const tintColorLight = "#DC2626"; // Red similar to M-Pesa
const tintColorDark = "#EF4444";

export const Colors = {
  light: {
    text: "#1F2937",
    subtext: "#6B7280",
    textInverted: "#FFFFFF",
    background: "#F9FAFB",
    backgroundSecondary: "#FFFFFF",
    tint: tintColorLight,
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    purple: "#8B5CF6",
  },
  dark: {
    text: "#F9FAFB",
    subtext: "#9CA3AF",
    textInverted: "#FFFFFF",
    background: "#111827",
    backgroundSecondary: "#1F2937",
    tint: tintColorDark,
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
    border: "#374151",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    purple: "#A78BFA",
  },
};
