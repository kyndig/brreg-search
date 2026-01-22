# Brreg Search Raycast Extension — Consolidated Review (DRY)

This document consolidates and de-duplicates the findings from:
- `docs/composer-review.md`
- `docs/gpt-review.md`
- `docs/opus-review.md`

It preserves **all unique, actionable information** from the source reviews while removing repetition. Where statements conflict, they are captured under **TODO (verify contradictions)**.

---

## Executive summary

Overall, this is a **well-structured Raycast extension** with clean separation of concerns (hooks/utilities/components), solid TypeScript usage, and a good feature set (search, favorites, company details with tabs).

- **Overall grade/assessment**: A- / “well-architected, production-ready” (Noted in: Composer)
- **Main improvement themes**:
  - **Correctness/behavioral issues** (move mode state inconsistency; search effect dependency; back actions/no-op actions) (Noted in: GPT, Opus)
  - **Raycast platform alignment** (keyboard handling model; icon types; navigation conventions) (Noted in: GPT, Opus)
  - **Network reliability + policy compliance** (abortable search; Nominatim contact + caching/rate limiting; avoiding tile-to-base64 memory overhead) (Noted in: Composer, GPT)
  - **Maintainability/DRY** (duplicate helpers; dead/unused modules; redundant type assertions; confusing no-op callbacks) (Noted in: GPT, Opus, Composer)
  - **Test/CI gaps** (no tests, no CI/CD automation) (Noted in: Composer)

---

## What was reviewed (scope)

Across the three reviews, the following areas were explicitly reviewed:

- **Entry/command**: [`package.json`](../package.json), [`src/brreg-search.tsx`](../src/brreg-search.tsx) (Noted in: GPT)
- **API + types**: [`src/brreg-api.ts`](../src/brreg-api.ts), [`src/types.ts`](../src/types.ts) (Noted in: GPT, Composer, Opus)
- **Hooks**:
  - [`src/hooks/useSearch.ts`](../src/hooks/useSearch.ts) (Noted in: GPT, Opus, Composer)
  - [`src/hooks/useFavorites.ts`](../src/hooks/useFavorites.ts) (Noted in: GPT, Opus, Composer)
  - [`src/hooks/useCompanyView.ts`](../src/hooks/useCompanyView.ts) (Noted in: GPT, Composer)
  - [`src/hooks/useKeyboardShortcuts.ts`](../src/hooks/useKeyboardShortcuts.ts) (Noted in: GPT, Opus, Composer)
  - [`src/hooks/useSettings.ts`](../src/hooks/useSettings.ts) (Noted in: GPT)
- **UI components**:
  - Favorites/search/details/actions/help views (Noted in: GPT, Composer, Opus)
  - [`src/components/CompanyDetailsView.tsx`](../src/components/CompanyDetailsView.tsx) (Noted in: Composer, GPT, Opus)
  - [`src/components/KeyboardShortcutsHelp.tsx`](../src/components/KeyboardShortcutsHelp.tsx) (Noted in: GPT, Opus)
  - [`src/components/FavoritesList.tsx`](../src/components/FavoritesList.tsx) (Noted in: Composer, GPT, Opus)
  - [`src/components/SearchResults.tsx`](../src/components/SearchResults.tsx) (Noted in: Composer, Opus)
- **Utils**:
  - [`src/utils/entity.ts`](../src/utils/entity.ts) (Noted in: GPT, Opus)
  - [`src/utils/format.ts`](../src/utils/format.ts) (Noted in: GPT)
  - [`src/utils/toast.ts`](../src/utils/toast.ts) (Noted in: Composer)
- **Configuration/constants**: [`src/constants/index.ts`](../src/constants/index.ts) (Noted in: Composer, GPT)

---

## Architecture & design (strengths)

- **Clean component architecture / separation of concerns**:
  - The main orchestrator component (`src/brreg-search.tsx`) composes `FavoritesList`, `SearchResults`, and `CompanyDetailsView` (Noted in: Composer)
  - Action components (`EntityActions`, `FavoriteActions`, `SearchResultActions`) centralize UI actions and reduce duplication (Noted in: Composer, Opus)
- **Custom hooks with single responsibility**:
  - `useFavorites`, `useSearch`, `useCompanyView`, `useKeyboardShortcuts` separated by concern (Noted in: Composer)
- **Centralized configuration**:
  - `src/constants/index.ts` is used as a config hub (Noted in: Composer)
- **Performance-minded patterns**:
  - `React.memo` on action components, memoized derived state, efficient `Set`/`Map` usage (Noted in: Composer)
- **Strong baseline TypeScript hygiene**:
  - No suppression comments like `@ts-ignore` / `@ts-expect-error` called out; prop interfaces are generally clear (Noted in: Composer)

---

## High-signal findings (prioritized)

### Correctness / behavioral bugs

- **Move mode has split / inconsistent state**:
  - `useFavorites()` exposes `toggleMoveMode()` and `showMoveIndicators`.
  - The UI display/indicators are rendered based on `useKeyboardShortcuts().showMoveIndicators`.
  - Result: **`⌘⇧M` toggle may not affect the displayed indicators**, and “hold ⌘⇧” behavior may disagree with “toggle move mode.” (Noted in: GPT)
  - Files: [`src/brreg-search.tsx`](../src/brreg-search.tsx), [`src/hooks/useFavorites.ts`](../src/hooks/useFavorites.ts), [`src/hooks/useKeyboardShortcuts.ts`](../src/hooks/useKeyboardShortcuts.ts)

- **`useSearch` effect dependency bug**:
  - The effect depends on `searchText` but uses computed `trimmed` / `isNumeric`, leading to unnecessary runs (e.g. trailing spaces). Recommendation was to depend on `trimmed`. (Noted in: Opus)
  - File: [`src/hooks/useSearch.ts`](../src/hooks/useSearch.ts)

- **Keyboard shortcuts help “Back” action does nothing**:
  - “Back” uses `onAction={() => {}}` (no-op), so it’s non-functional. (Noted in: GPT)
  - File: [`src/components/KeyboardShortcutsHelp.tsx`](../src/components/KeyboardShortcutsHelp.tsx)

- **Potential memory leak / setState after unmount in favorites enrichment**:
  - Async enrichment sets state without checking mounted status, so it could update after unmount. (Noted in: Opus)
  - File: [`src/hooks/useFavorites.ts`](../src/hooks/useFavorites.ts)

### Raycast platform alignment / API usage

- **Non-idiomatic icon values passed as string literals**:
  - Example: `"Icon.Globe"` should be `Icon.Globe`. Similar issues mentioned for `"Icon.ArrowUp"` etc.
  - Risk: icon rendering can silently degrade or break depending on runtime. (Noted in: Composer, GPT, Opus)
  - Files: [`src/components/FavoritesList.tsx`](../src/components/FavoritesList.tsx), [`src/utils/entity.ts`](../src/utils/entity.ts), [`src/hooks/useMemoizedActions.ts`](../src/hooks/useMemoizedActions.ts)

- **Keyboard event handling model may not work in Raycast**:
  - One review asserts Raycast doesn’t allow DOM/window keyboard listeners, making `useKeyboardShortcuts` effectively non-functional; another treats the hook as working and focuses on consistency/behavior. (Contradiction; see TODO section.) (Noted in: Opus, GPT)
  - File: [`src/hooks/useKeyboardShortcuts.ts`](../src/hooks/useKeyboardShortcuts.ts)

- **Backspace shortcut overloading**:
  - Backspace is used for “Previous Tab” in details and as “Back” in emoji form; this may conflict with Raycast conventions/expectations. (Noted in: GPT)
  - Files: [`src/constants/index.ts`](../src/constants/index.ts), [`src/components/CompanyDetailsView.tsx`](../src/components/CompanyDetailsView.tsx), [`src/components/EmojiForm.tsx`](../src/components/EmojiForm.tsx)

### UX / product mismatches

- **README vs implementation mismatch for partial numeric search**:
  - README claims “partial numeric search with full-text fallback,” but the current logic clears results for numeric queries < 9 digits. (Noted in: GPT)
  - File: [`src/hooks/useSearch.ts`](../src/hooks/useSearch.ts)

- **Favorites visibility during search**:
  - Favorites disappear when searching; some users may want favorites visible while typing to compare quickly. (Noted in: Composer)
  - File: [`src/brreg-search.tsx`](../src/brreg-search.tsx)

- **Empty state when favorites are empty**:
  - If there are no favorites and no active search, behavior depends on `showWelcomeMessage`; may need a dedicated empty state. (Noted in: Composer)

- **Move mode discoverability**:
  - The feature is clever but may be hard to discover; consider a clearer toggle affordance or more prominent shortcut help. (Noted in: Composer, GPT)

- **Company details loading states lack specificity**:
  - Details view indicates loading but not which section (basic vs financial vs map). (Noted in: Composer)

### Reliability / performance

- **Search requests aren’t cancellable (race risk)**:
  - Fast typing can result in stale responses overwriting newer results; recommendation to implement abort/cancel behavior. (Noted in: GPT)
  - File: [`src/hooks/useSearch.ts`](../src/hooks/useSearch.ts)

- **Favorites enrichment is parallelized and one-shot**:
  - Bulk `Promise.all` enrichment can burst requests and may not rerun for newly missing data (depending on current guard flag usage).
  - Suggested: concurrency limits, caching, and making enrichment re-runnable for newly added/updated items. (Noted in: Composer, GPT)
  - File: [`src/hooks/useFavorites.ts`](../src/hooks/useFavorites.ts)

- **Company details view tab markdown regeneration**:
  - Markdown for tabs is regenerated on each render; memoization suggested. (Noted in: Composer)
  - File: [`src/components/CompanyDetailsView.tsx`](../src/components/CompanyDetailsView.tsx)

- **Search results per-entity recalculation**:
  - `isFavorite`, `formatAddress`, etc. recalculated for each entity on every render; memoize or precompute. (Noted in: Composer)
  - File: [`src/components/SearchResults.tsx`](../src/components/SearchResults.tsx)

- **Map rendering pipeline concerns**:
  - Geocoding without rate limiting/caching.
  - Fetching tiles and converting to base64 data URIs is memory-inefficient.
  - Nominatim usage policy compliance concerns (see Security/Privacy section too). (Noted in: Composer, GPT)
  - File: [`src/components/CompanyDetailsView.tsx`](../src/components/CompanyDetailsView.tsx)

### Security & privacy

- **Strengths**:
  - No API keys required (public Brreg APIs) (Noted in: Composer)
  - Favorites stored locally (`@raycast/utils` localStorage) (Noted in: Composer)
  - Website URL validation/normalization is present (Noted in: Composer)

- **Concerns**:
  - Search queries go to endpoints with minimal additional sanitization (beyond `encodeURIComponent`); likely okay but flagged. (Noted in: Composer)
  - External map services (Nominatim/OSM tiles) have usage/policy considerations; privacy implications should be considered. (Noted in: Composer, GPT)
  - Favicon fetching (`getFavicon`) can leak favorite-company domains to third parties and can fail depending on CORS/policies. (Noted in: Composer)

### Maintainability / DRY / dead code

- **Dead or unused modules are called out**:
  - `src/components/ErrorBoundary.tsx` (unused)
  - `src/components/SettingsView.tsx` (unused)
  - `src/hooks/useMemoizedActions.ts` (unused)
  - `src/hooks/usePerformanceMonitor.ts` (unused)
  - Also: `useSettings()` defines settings that may not be wired into behavior. (Noted in: Opus, GPT)

- **Duplicate helpers**:
  - `getMoveIndicators` duplicated in `src/utils/entity.ts` and `src/hooks/useMemoizedActions.ts`, plus additional inlining in UI.
  - `getEntityIcon` duplicated similarly.
  - Brreg URL formatting duplicated instead of reusing a single helper. (Noted in: GPT, Opus)

- **Guard clause/type safety duplication in `brreg-search.tsx`**:
  - Defensive checks for hooks returning undefined, plus redundant casts like `favoriteIds as Set<string>`. This suggests types/contracts could be tightened. (Noted in: Composer, Opus)

- **Confusing no-op callbacks**:
  - `onCopyOrgNumber` / `onCopyAddress` etc are empty implementations despite `Action.CopyToClipboard` handling the copy; recommendation to remove props or make them meaningful. (Noted in: Composer, Opus)
  - File: [`src/components/SearchResults.tsx`](../src/components/SearchResults.tsx)

- **Commented-out code**:
  - Commented accessories in `FavoritesList` should be removed or implemented. (Noted in: Opus)
  - File: [`src/components/FavoritesList.tsx`](../src/components/FavoritesList.tsx)

### API integration / data parsing

- **Strengths**:
  - XML parsing for annual accounts is sophisticated with multiple fallbacks and locale-aware number parsing (Noted in: Composer)
  - Smart search logic (numeric vs text, 9-digit org validation, avoid API calls for incomplete org numbers) (Noted in: Composer)
  - Website URL normalization is implemented with URL validation (Noted in: Composer)

- **Issues / suggestions**:
  - Hardcoded API User-Agent string could drift from version; suggestion to derive from `package.json`. (Noted in: Composer)
  - Missing explicit rate limiting / request queue for API calls (Noted in: Composer)
  - Silent `catch { return null; }` blocks reduce debuggability; suggestion to add context/logging (at least in development). (Noted in: Composer, Opus)
  - Regex-based XML parsing is inherently fragile; suggestion to use a proper parser or more structured extraction strategy. (Noted in: Opus, GPT)
  - Nominatim compliance: use a real contact identifier and add lightweight caching/rate limiting. (Noted in: GPT)

### Dependencies

- `node-fetch` is flagged as questionable if Raycast environment provides modern `fetch`; removing reduces dependency surface and avoids ESM friction. (Noted in: Composer, GPT)

---

## Prioritized remediation roadmap (merged)

### Immediate (high impact / likely low effort)
- **Fix icon usage**: replace `"Icon.*"` string literals with proper `Icon.*` constants (and ensure all icon-like values are valid) (Noted in: Composer, GPT, Opus)
- **Fix move mode state model**: unify toggle/hold behavior with a single source of truth across `useFavorites` / `useKeyboardShortcuts` / UI rendering (Noted in: GPT)
- **Fix `useSearch` dependency array**: depend on `trimmed` (or otherwise align dependencies to computed values) (Noted in: Opus)
- **Fix “Back” action in keyboard shortcuts help**: wire to navigation pop/back semantics (Noted in: GPT)

### Short-term (reliability + maintainability)
- **Make search abortable/cancellable**: prevent stale-result overwrites on fast typing (Noted in: GPT)
- **Harden favorites enrichment**:
  - add mounted checks / cleanup
  - add concurrency limits and caching
  - make enrichment re-runnable for newly missing data (Noted in: GPT, Opus, Composer)
- **Map service improvements**:
  - Nominatim: real contact identifier + caching/rate limiting
  - reconsider tile fetching + base64 conversion (memory) (Noted in: Composer, GPT)
- **Deduplicate utilities** (`getMoveIndicators`, `getEntityIcon`, Brreg URL helper) and remove or meaningfully wire unused hooks/components (Noted in: GPT, Opus)
- **Reduce dependency surface**: prefer global `fetch` if supported; revisit `node-fetch` (Noted in: Composer, GPT)

### Medium-term
- **Memoize expensive UI computations**:
  - details markdown generation
  - per-entity computed props in result lists (Noted in: Composer, Opus)
- **Improve error reporting**:
  - preserve error context (timeout vs 404 vs 500)
  - log selectively in development (Noted in: Composer, Opus)
- **Clarify/align README and behavior** for partial numeric search vs strict 9-digit enforcement (Noted in: GPT, Composer)

### Long-term enhancements (product + engineering)
- **Add tests** (utilities, hooks, and component integration tests) (Noted in: Composer)
- **Add CI/CD** (lint/test checks, automation) (Noted in: Composer)
- **Feature ideas**:
  - offline support / caching
  - search history
  - favorites export (JSON/CSV)
  - advanced filtering (industry/size/location)
  - financial trends visualization (Noted in: Composer)

---

## TODO (verify contradictions)

These items are **explicit contradictions** across the source reviews and should be verified against Raycast’s runtime model and the actual extension behavior:

1. **`useKeyboardShortcuts` viability**
   - Claim A: Raycast sandbox doesn’t allow DOM/window keyboard listeners; hook is effectively non-functional and should be removed. (Opus)
   - Claim B: The hook participates in rendered UI state (move indicators) and the issue is inconsistent state modeling rather than total non-functionality. (GPT)

2. **`ErrorBoundary` handling**
   - Claim A: `ErrorBoundary` exists but isn’t used; it should wrap the main component in `src/brreg-search.tsx`. (Composer)
   - Claim B: `ErrorBoundary.tsx` is dead/unused and should be removed unless it’s actually wired up. (Opus)

3. **Severity classification (“no critical issues” vs “critical bugs exist”)**
   - Claim A: “None identified” under critical issues. (Composer)
   - Claim B: Several items are labeled critical, including `useSearch` dependency bug and keyboard shortcut hook behavior. (Opus)

