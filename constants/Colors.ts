/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Modern color scheme inspired by M-Pesa and clean fintech applications.
 */

const tintColorLight = "#DC2626"; // M-Pesa red
const tintColorDark = "#EF4444";

export const Colors = {
  light: {
    text: "#1F2937",
    subtext: "#6B7280",
    textInverted: "#FFFFFF",
    background: "#F8FAFC",
    backgroundSecondary: "#FFFFFF",
    tint: tintColorLight,
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    purple: "#8B5CF6",
    google: "#4285F4",
    facebook: "#1877F2",
  },
  dark: {
    text: "#F8FAFC",
    subtext: "#94A3B8",
    textInverted: "#FFFFFF",
    background: "#0F172A",
    backgroundSecondary: "#1E293B",
    tint: tintColorDark,
    icon: "#94A3B8",
    tabIconDefault: "#64748B",
    tabIconSelected: tintColorDark,
    border: "#334155",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    purple: "#A78BFA",
    google: "#4285F4",
    facebook: "#1877F2",
  },
};
