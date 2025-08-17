import { useLocalStorage } from "@raycast/utils";

interface UserSettings {
  showWelcomeMessage: boolean;
  defaultSearchType: "name" | "number" | "both";
  maxSearchResults: number;
  showMoveIndicators: boolean;
  enablePerformanceMonitoring: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  showWelcomeMessage: true,
  defaultSearchType: "both",
  maxSearchResults: 50,
  showMoveIndicators: false,
  enablePerformanceMonitoring: false,
};

/**
 * Hook for managing user settings and preferences
 */
export function useSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>("user-settings", DEFAULT_SETTINGS);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const toggleSetting = <K extends keyof UserSettings>(key: K) => {
    if (typeof settings[key] === "boolean") {
      updateSetting(key, !settings[key] as boolean);
    }
  };

  return {
    settings,
    updateSetting,
    resetToDefaults,
    toggleSetting,
    DEFAULT_SETTINGS,
  };
}
