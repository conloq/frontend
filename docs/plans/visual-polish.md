---
plan name: visual-polish
plan description: Polish visual frontend flows
plan status: active
---

## Idea
Implement a frontend-only visual polish pass for the existing EJS preview. Preserve the current visual language, routes, form field names, and server separation. Improve navigation affordances without inventing backend endpoints, add honest unavailable states for unfinished modules, add accessible feedback surfaces and client-side validation where they are purely presentational, and verify the result through the running preview at desktop and mobile sizes. Do not add mocks, services, persistence, authentication, API calls, or backend code.

## Implementation
- Inspect the current EJS screens, shared partials, CSS source, and global browser script; record the exact selectors and existing navigation contracts before editing.
- Review the running preview in the Maestri portal at desktop and mobile widths, capturing the current visual state and identifying only concrete layout, navigation, and accessibility defects in scope.
- Update shared navigation and screen markup to replace dead affordances with explicit unavailable states or valid existing preview destinations, while preserving all existing visual patterns and avoiding invented backend routes.
- Add minimal client-side presentation behavior for validation, confirmation, loading/error/success/empty/unavailable messaging, modal and drawer accessibility, without persistence or API calls.
- Run syntax, EJS compilation, Tailwind build, route smoke checks, and portal navigation checks at desktop and mobile sizes; inspect the final diff to ensure only frontend files changed.

## Required Specs
<!-- SPECS_START -->
- visual-flows
<!-- SPECS_END -->