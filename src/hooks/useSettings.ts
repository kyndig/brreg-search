import { useLocalStorage } from "@raycast/utils";

interface UserSettings {
  showWelcomeMessage: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  showWelcomeMessage: true,
};

/**
 * Hook for managing user settings and preferences
 */
export function useSettings() {
  const {
    value: settings,
    setValue: setSettings,
    isLoading,
  } = useLocalStorage<UserSettings>("user-settings", DEFAULT_SETTINGS);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const current = settings ?? DEFAULT_SETTINGS;
    setSettings({ ...current, [key]: value });
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const toggleSetting = <K extends keyof UserSettings>(key: K) => {
    const current = settings ?? DEFAULT_SETTINGS;
    if (typeof current[key] === "boolean") {
      updateSetting(key, !current[key] as boolean as UserSettings[K]);
    }
  };

  return {
    settings: settings ?? DEFAULT_SETTINGS,
    updateSetting,
    resetToDefaults,
    toggleSetting,
    DEFAULT_SETTINGS,
    isLoading,
  };
}
