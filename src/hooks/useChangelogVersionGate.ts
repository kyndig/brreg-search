import { useEffect, useMemo } from "react";
import { useLocalStorage } from "@raycast/utils";
import { APP_VERSION, STORAGE_KEYS } from "../constants";

export function shouldDisplayChangelog(lastSeenVersion: string | undefined, currentVersion: string): boolean {
  const normalizedLastSeen = lastSeenVersion?.trim();
  const normalizedCurrent = currentVersion.trim();

  if (!normalizedCurrent || !normalizedLastSeen) {
    return false;
  }

  return normalizedLastSeen !== normalizedCurrent;
}

export function useChangelogVersionGate(currentVersion = APP_VERSION) {
  const {
    value: lastSeenVersion,
    setValue: setLastSeenVersion,
    isLoading,
  } = useLocalStorage<string>(STORAGE_KEYS.LAST_SEEN_CHANGELOG_VERSION);

  useEffect(() => {
    if (isLoading) return;

    const normalizedCurrent = currentVersion.trim();
    if (!normalizedCurrent) return;

    if (lastSeenVersion === undefined) {
      setLastSeenVersion(normalizedCurrent);
    }
  }, [currentVersion, isLoading, lastSeenVersion, setLastSeenVersion]);

  const shouldShowChangelog = useMemo(
    () => !isLoading && shouldDisplayChangelog(lastSeenVersion, currentVersion),
    [currentVersion, isLoading, lastSeenVersion],
  );

  const markCurrentVersionAsSeen = async () => {
    const normalizedCurrent = currentVersion.trim();
    if (!normalizedCurrent || lastSeenVersion === normalizedCurrent) return;
    await setLastSeenVersion(normalizedCurrent);
  };

  return {
    lastSeenVersion,
    shouldShowChangelog,
    markCurrentVersionAsSeen,
    isLoading,
  };
}
