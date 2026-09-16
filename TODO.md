# TODO: Remove Multilingual Feature

## Overview

User requested to remove all multilingual code from the project, reverting to English-only. This includes deleting translation services, contexts, selectors, and hardcoded translations in components/pages.

## Steps to Complete

- [ ] Edit src/App.tsx: Remove LanguageProvider import and wrapper.
- [ ] Edit src/components/Navbar.tsx: Remove language-related imports, state, useEffect, selector; hardcode English texts.
- [ ] Edit src/pages/Services.tsx: Remove language-related imports, state, useEffect; hardcode English texts.
- [ ] Remove src/contexts/LanguageContext.tsx: Delete entire file.
- [ ] Remove src/services/translationService.ts: Delete entire file.
- [ ] Uninstall axios: Run `npm uninstall axios`.
- [ ] Cleanup: Clear localStorage translation caches (manual or via console).
- [ ] Test: Run `npm run dev`, verify English-only UI, no errors, no lag.
- [ ] Update this TODO.md: Mark all as complete.

## Notes

- App reverts to English-only; no API calls or caching.
- Other pages (if any used multilingual) should be checked, but based on analysis, only Navbar and Services are affected.
- After removal, project is lighter and faster.
