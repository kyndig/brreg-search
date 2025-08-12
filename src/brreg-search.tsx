import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@raycast/utils";
import fetch from "node-fetch"; // If your Node version < 18

interface EnheterResponse {
  _embedded?: {
    enheter?: Enhet[];
  };
}

interface Enhet {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: {
    land?: string;
    landkode?: string;
    postnummer?: string;
    poststed?: string;
    adresse?: string[];
    kommune?: string;
    kommunenummer?: string;
  };
}

// Helper function to format address
function formatAddress(addr?: Enhet["forretningsadresse"]): string {
  if (!addr) {
    return "";
  }
  const street = addr.adresse?.join(", ") ?? "";
  const post = [addr.postnummer, addr.poststed].filter(Boolean).join(" ");
  const country = addr.land ?? "Norge";

  return [street, post, country].filter(Boolean).join(", ");
}

// Helper function to detect numeric vs text input
function isAllDigits(str: string) {
  return /^\d+$/.test(str);
}

export default function SearchAndCopyCommand() {
  const [searchText, setSearchText] = useState("");
  const [entities, setEntities] = useState<Enhet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    value: favorites,
    setValue: setFavorites,
    isLoading: isLoadingFavorites,
  } = useLocalStorage<Enhet[]>("favorites", []);

  const trimmed = searchText.trim();
  const isNumeric = isAllDigits(trimmed);

  useEffect(() => {
    // If empty, clear results
    if (!trimmed) {
      setEntities([]);
      return;
    }

    // Org. No.'s are exactly 9 digits in Norway, avoid calling the API with less
    if (isNumeric && trimmed.length < 9) {
      setEntities([]);
      return;
    }

    // Decide which parameter to use for the API call. Norwegian words for the API call
    const paramName = isNumeric ? "organisasjonsnummer" : "navn";

    async function fetchEntities() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://data.brreg.no/enhetsregisteret/api/enheter?${paramName}=${encodeURIComponent(trimmed)}`,
        );
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        const data = (await response.json()) as EnheterResponse;
        setEntities(data._embedded?.enheter || []);
      } catch (error) {
        showToast(Toast.Style.Failure, "Failed to fetch legal entities", (error as { message?: string })?.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntities();
  }, [searchText]);

  const favoritesList = favorites ?? [];

  const favoriteIds = useMemo(() => new Set(favoritesList.map((f) => f.organisasjonsnummer)), [favoritesList]);

  function addFavorite(entity: Enhet) {
    if (favoriteIds.has(entity.organisasjonsnummer)) {
      return;
    }
    const next = [entity, ...favoritesList];
    setFavorites(next);
    showToast(Toast.Style.Success, "Added to Favorites", entity.navn);
  }

  function removeFavorite(entity: Enhet) {
    if (!favoriteIds.has(entity.organisasjonsnummer)) {
      return;
    }
    const next = favoritesList.filter((f) => f.organisasjonsnummer !== entity.organisasjonsnummer);
    setFavorites(next);
    showToast(Toast.Style.Success, "Removed from Favorites", entity.navn);
  }

  return (
    <List
      isLoading={isLoading || isLoadingFavorites}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Search for name or organisation number"
    >
      {favoritesList.length > 0 && (
        <List.Section title="Favorites">
          {favoritesList.map((entity) => {
            const addressString = formatAddress(entity.forretningsadresse);
            return (
              <List.Item
                key={`fav-${entity.organisasjonsnummer}`}
                title={entity.navn}
                subtitle={entity.organisasjonsnummer}
                accessories={addressString ? [{ text: addressString }] : []}
                actions={
                  <ActionPanel>
                    <Action.CopyToClipboard content={entity.organisasjonsnummer} title="Copy Org. Nr." />
                    {addressString && <Action.CopyToClipboard content={addressString} title="Copy Business Address" />}
                    <Action.OpenInBrowser
                      shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                      title="Open in Brønnøysundregistrene"
                      url={`https://virksomhet.brreg.no/nb/oppslag/enheter/${entity.organisasjonsnummer}`}
                    />
                    <Action
                      title="Remove from Favorites"
                      onAction={() => removeFavorite(entity)}
                      shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}

      {entities.length === 0 && isNumeric && trimmed.length > 0 && trimmed.length < 9 ? (
        <List.EmptyView
          title="Waiting for 9 digits"
          description="Norwegian organisation numbers are 9 digits long. Keep typing…"
        />
      ) : (
        <List.Section title="Results">
          {entities.map((entity) => {
            const addressString = formatAddress(entity.forretningsadresse);
            const alreadyFavorite = favoriteIds.has(entity.organisasjonsnummer);
            return (
              <List.Item
                key={entity.organisasjonsnummer}
                title={entity.navn}
                subtitle={entity.organisasjonsnummer}
                accessories={addressString ? [{ text: addressString }] : []}
                actions={
                  <ActionPanel>
                    <Action.CopyToClipboard content={entity.organisasjonsnummer} title="Copy Org. Nr." />
                    {addressString && <Action.CopyToClipboard content={addressString} title="Copy Business Address" />}
                    <Action.OpenInBrowser
                      shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                      title="Open in Brønnøysundregistrene"
                      url={`https://virksomhet.brreg.no/nb/oppslag/enheter/${entity.organisasjonsnummer}`}
                    />
                    {alreadyFavorite ? (
                      <Action title="Remove from Favorites" onAction={() => removeFavorite(entity)} />
                    ) : (
                      <Action title="Add to Favorites" onAction={() => addFavorite(entity)} />
                    )}
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}
    </List>
  );
}
