# Brreg (Norwegian Company Register) Raycast Extension

Search and retrieve information about Norwegian companies (Enhetsregisteret) directly from the Raycast command bar. The extension uses the official [Brønnøysund Register Center (Brreg)](https://www.brreg.no) API to find companies by name or organisation number.

![Extension screenshot](metadata/brreg-2.png)

## Features

- **Search by Name**: Type any part of a company's name to view matching results from Brreg.
- **Search by Organisasjonsnummer**: Type a 9-digit organisation number to retrieve an exact match.
- **Partial Numeric Search**: If you type fewer than 9 digits, the extension can optionally use Brreg's full-text search (`q` param) to show partial matches.
- **Copy Data**: Copy the organisation number or address with a single action.
- **Open in Browser**: Quickly jump to the company's details page in the Brønnøysund Register website.
- **Favorites**: Save companies to a favorites list that appears above your search results. Revisit them instantly, copy details, or open them in the browser. Favorites are stored locally and persist across sessions.

## Favorites

- Add a favorite: Select a company in the results and choose "Add to Favorites" from the action panel.
- Remove a favorite: Select it from the Favorites section and choose "Remove from Favorites" (shortcut: `⌘⌫`).
- Favorites appear in a dedicated section above the search results and are stored locally on your device.

## Requirements

- **No credentials or API keys** are required. Brreg provides open, free access to its Enhetsregisteret endpoints.

## Privacy & Data Usage

- No user credentials or passwords are required by this extension.
- The extension sends your search query (name or number) to the public Brreg API to retrieve matching entities.
- All information collected from the user is used solely to connect to Brreg and improve the extension’s response.
- We do not store, share, or process personal data outside of fulfilling these requests.

Made with 🫶 by [kynd](https://kynd.no)
