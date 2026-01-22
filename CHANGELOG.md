# BRREG Search Changelog

## [Documentation Update] [2.0.3] - [PR_MERGE_DATE]
- Updated README to accurately reflect current functionality
- Removed documentation for non-existent features
- Added explicit privacy and networking section
- Normalised changelog format

## [Keyboard Shortcuts for Financial Data] [2.0.2] - 2025-08-25
- Added keyboard shortcuts for copying revenue (⌘⇧R) and net result (⌘⇧N)
- Refactored all keyboard shortcuts to use centralised constants for better maintainability

## [Minor Updates and Typography Fixes] [2.0.1] - 2025-08-25
- Updated Welcome message
- Added Keyboard Shortcuts to the Welcome screen and made it available from all views
- Companies can now be added (⌘F) or removed (⌘⇧F) from Favourites, including from the Detail view
- Favourites are hidden while typing; only search results show once you start typing
- Added a visual metadata tag indicating whether a company is in the Favourites list or not
- Simplified Favourites empty state copy
- Added link to GitHub for feedback and feature requests
- Removed unnecessary settings view
- Fixed some links not working as intended

## [Major Refactoring & Enhancement Release] [2.0.0] - 2025-08-19

### Enhanced User Experience
- **Welcome Messages**: Helpful onboarding for new users with no favourites
- **Keyboard Shortcuts Help**: Comprehensive guide accessible from the welcome section
- **Improved Empty States**: Better guidance when no favourites or search results exist

### Architecture Improvements
- **Component Extraction**: Broke down monolithic component into focused, reusable pieces
- **Custom Hooks**: Extracted business logic into specialised hooks for better maintainability
- **Zero Code Duplication**: Eliminated all redundant action code with shared components
- **Performance Optimisation**: React.memo implementation and optimised data structures

### New Components
- **EntityActions**: Common actions for all entities (view, copy, open in browser)
- **FavoriteActions**: Specialised actions for favourites (emoji, reorder, remove)
- **SearchResultActions**: Conditional actions for search results
- **KeyboardShortcutsHelp**: Comprehensive shortcuts reference
- **ErrorBoundary**: Robust error handling with graceful fallbacks

### Technical Enhancements
- **Type Safety**: 100% TypeScript coverage with strict typing
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Constants Management**: Centralised configuration for easy maintenance
- **Dependency Cleanup**: Removed unused Google Static Maps API key requirement

## [Initial Enhancement Release] [1.1.0] - 2025-08-19

### What's Changed
- Corrected the English name of Brønnøysundregistrene to the official translation (The Brønnøysund Register Centre).

### What's New
- Favourite entities to keep your most-used companies and organisations at your fingertips
- Basic search functionality for Norwegian companies
- Company details view with financial information
- Map integration for company locations

## [Initial Release] [1.0.0] - 2025-02-25

### Core Features
- Search Norwegian companies by name or organisation number
- View company details and financial information
- Copy company data to clipboard
- Open companies in Brønnøysundregistrene website

Made with 🫶 by [kynd](https://www.kynd.no)
