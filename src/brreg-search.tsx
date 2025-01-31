import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import fetch from "node-fetch"; // For older Node versions; if you have Node 18+ you can omit.

interface EnheterResponse {
  _embedded?: {
    enheter?: Enhet[];
  };
  // ... other fields if needed
}

interface Enhet {
  organisasjonsnummer: string;
  navn: string;
  // ... other fields if needed
}

export default function SearchAndCopyCommand() {
  const [searchText, setSearchText] = useState("");
  const [enheter, setEnheter] = useState<Enhet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchText.trim()) {
      setEnheter([]);
      return;
    }

    async function fetchEnheter() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(searchText)}`
        );
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        const data: EnheterResponse = await response.json();
        const fetchedEnheter = data._embedded?.enheter || [];
        setEnheter(fetchedEnheter);
      } catch (error: any) {
        showToast(Toast.Style.Failure, "Failed to fetch enheter", error?.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnheter();
  }, [searchText]);

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Search Enhetsregisteret by navn..."
    >
      {enheter.map((enhet) => (
        <List.Item
          key={enhet.organisasjonsnummer}
          title={enhet.navn}
          subtitle={enhet.organisasjonsnummer}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard
                content={enhet.organisasjonsnummer}
                title="Copy Organisasjonsnummer"
              />
              <Action.OpenInBrowser
                title="Open in Brønnøysundregistrene"
                url={`https://virksomhet.brreg.no/nb/oppslag/enheter/${enhet.organisasjonsnummer}`}
              />
            </ActionPanel>
          
          }
        />
      ))}
    </List>
  );
}