import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
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

  useEffect(() => {
		const trimmed = searchText.trim();

    // If empty, clear results
    if (!trimmed) {
      setEntities([]);
      return;
    }

    // If user typed only digits, use ?organisationnumber=, else ?name=
    const isNumeric = isAllDigits(trimmed);

    // Org. No.'s are exactly 9 digits in Norway, avoid calling the API with less
		if (isNumeric && trimmed.length < 9) {
			setEntities([]);
			return;
		}

		// Decide which parameter to use for the API call. Norwegian words for the API call
		const paramName = isNumeric ? "organisasjonsnummer" : "navn";
		// console.debug(paramName);

    async function fetchEntities() {
      setIsLoading(true);
			console.debug(paramName);
			console.debug(encodeURIComponent(trimmed));
			console.debug(`https://data.brreg.no/enhetsregisteret/api/enheter?${paramName}=${encodeURIComponent(trimmed)}`);
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

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Search for name or organisation number"
    >
      {entities.map((entity) => {
        const addressString = formatAddress(entity.forretningsadresse);
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
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
