# Spec: visual-flows

Scope: feature

# Visual Flows Feature Spec

## Objective
Polish the Sistema-MASH frontend preview so the principal EJS screens communicate valid navigation and clear UI states while the backend is being developed separately.

## Scope
- Frontend-only changes in `views/`, `public/`, and frontend documentation when necessary.
- Preserve EJS templates and existing visual language based on Tailwind and Phosphor Icons.
- Preserve valid existing preview routes, form field names, and current shell composition.
- Use only honest visual states for unavailable backend functionality; do not invent successful API calls or persistence.

## Out of scope
- Backend routes, controllers, models, authentication, sessions, database, authorization enforcement, API clients, persistence, or business rules.
- New mock services or JavaScript data layers.
- Claiming that a form operation succeeded when no backend contract exists.

## Requirements
1. Map and review Painel, Iodo, Lotes, Receitas, Configuração, Perfil, login, cadastro, temperature, and iodine screens.
2. Replace dead `href="#"` affordances with explicit unavailable presentation or valid existing preview destinations. Do not invent backend routes.
3. Remove or clearly label recovery-password navigation as unavailable until a backend route exists.
4. Keep forms visually ready for future integration and preserve their fields, labels, and intended destinations where those destinations are documented.
5. Add presentational states for loading, success, validation error, request error, expired session, unauthorized access, not found, and empty data without API calls or persistence.
6. Hide or disable actions only as a visual preview of permission states; document that backend authorization remains authoritative.
7. Protect the global browser script against absent elements and ensure messages, modal behavior, drawer behavior, focus, and keyboard interactions are accessible.
8. Verify EJS compilation, JavaScript syntax, CSS build, route rendering, desktop/mobile layouts, navigation, and the absence of backend edits.

## Acceptance criteria
- No misleading `href="#"` remains on user-facing navigation controls in the reviewed screens.
- No frontend change introduces a backend dependency or invented API contract.
- Every reviewed screen has a coherent empty/unavailable/error presentation where relevant.
- Existing preview pages continue rendering successfully.
- Keyboard focus and screen-reader announcements are available for interactive state changes.
- Verification evidence is recorded with commands and portal observations.