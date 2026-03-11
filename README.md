# Brreg Search

Search Norwegian companies from the Central Coordinating Register for Legal Entities (Enhetsregisteret). Find companies by name or organisation number, view details, and keep favourites close at hand.

![Extension screenshot](metadata/brreg-2.png)

## What It Does

Search for Norwegian companies directly from Raycast. View company details, financial information, and locations. Save favourites for quick access. All data comes from the official [Brønnøysund Register Centre (Brreg)](https://www.brreg.no) API.

## Quick Start

Type a company name or 9-digit organisation number in the search bar.

**Examples:**
- `Equinor` — search by name
- `916880286` — search by organisation number (exactly 9 digits)
- `DNB` — partial name search

## Search Rules

- **Name search**: Type any part of a company name. Results update as you type (debounced for performance).
- **Organisation number**: Must be exactly 9 digits. Incomplete numbers won't trigger a search.

## Favourites

Favourites are stored locally using Raycast's local storage. They appear above search results and hide while you're typing.

- **Add / Remove**: `⌘F` to add, `⌘⇧F` to remove — works from search results and company details
- **Emoji**: Choose from predefined categories or set a custom emoji
- **Favicon**: Company website favicons are detected and displayed automatically
- **Reorder**: Toggle move mode with `⌘⇧M`, then `⌘⇧↑` / `⌘⇧↓` to reorder

## Company Details

Three tabs:

- **Overview**: Description, contact info, organisation number, address, employees, industry codes (NACE), VAT and audit status, founding date, last filing date
- **Financials**: Revenue, EBITDA, operating result, net result, total assets, equity, total debt, depreciation, audit status
- **Map**: Location via OpenStreetMap with a link to Google Maps

**External links:** Brønnøysundregistrene website, Proff.no

## Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| View company details | `Enter` |
| Open in Brønnøysundregistrene | `⌘⇧↵` |
| Go back | `⌘←` |
| Add to favourites | `⌘F` |
| Remove from favourites | `⌘⇧F` |
| Toggle move mode | `⌘⇧M` |
| Move favourite up / down | `⌘⇧↑` / `⌘⇧↓` |
| Copy organisation number | `⌘⇧C` |
| Copy business address | `⌘⇧B` |
| Copy revenue | `⌘⇧R` |
| Copy net result | `⌘⇧N` |
| Switch tab | `⌘1` / `⌘2` / `⌘3` |
| Previous tab | `Backspace` |

## Privacy & Networking

**External requests:**
- **Brreg API** (`data.brreg.no`): Search queries and organisation numbers
- **Brreg Regnskapsregisteret** (`data.brreg.no/regnskapsregisteret`): Financial data
- **Nominatim** (`nominatim.openstreetmap.org`): Geocoding company addresses
- **OpenStreetMap tiles** (`tile.openstreetmap.org`): Map display
- **Favicon service** (via `@raycast/utils`): Company website favicons

**Stored locally:** Favourites (organisation number, name, address, emoji/favicon) in Raycast local storage.

**Opened in browser only:** Google Maps, Proff.no, Brønnøysundregistrene.

No credentials, API keys, or personal data required or collected.

## Requirements

None. Brreg provides open, free access to Enhetsregisteret. Maps use free OpenStreetMap services. Google Maps directions are opened via link — no API key needed.

## Feedback

Feature requests and issues: [GitHub repository](https://github.com/kyndig/brreg-search)

Made with 🫶 by [kynd](https://kynd.no)
