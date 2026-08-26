# Phosphor Recipes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace textual action glyphs in the `/receita` frontend with accessible Phosphor Icons while preserving all existing routes, forms, and behavior.

**Architecture:** Keep the existing EJS templates and Phosphor stylesheet integration. The change is limited to presentational markup in `views/receita.ejs` and the shared mobile trigger in `views/partials/topBar.ejs`; no backend or route code changes are allowed.

**Tech Stack:** EJS, Tailwind CSS v4, Phosphor Icons web stylesheet.

**Spec:** Approved frontend-only direction in the conversation.

## Global Constraints

- Modify only frontend templates and frontend documentation.
- Do not edit controllers, routes, models, middleware, database, session, or server configuration.
- Preserve all existing `href`, `action`, method, field names, and modal data attributes.
- Use the already-installed Phosphor stylesheet; add no dependency.
- Keep icon-only controls keyboard accessible with explicit `aria-label` values.
- Keep action targets at least 44px tall/wide.

---

### Task 1: Replace recipe action glyphs

**Files:**
- Modify: `views/receita.ejs`

**Interfaces:**
- Consumes: Existing recipe links, delete form, modal trigger, and modal close control.
- Produces: Phosphor-marked controls with unchanged navigation and submission behavior.

- [ ] Replace the create button's literal `+` with `<i class="ph ph-plus" aria-hidden="true"></i>`.
- [ ] Replace the temperature-add `+` link with `ph-plus` and explicit `aria-label="Adicionar temperatura"`.
- [ ] Replace the temperature-edit text glyph with `ph-pencil-simple` and explicit `aria-label="Editar temperatura"`.
- [ ] Replace the delete glyph with `ph-trash` and explicit `aria-label="Excluir receita"`.
- [ ] Replace the modal close glyph with `ph-x` and preserve `data-modal-close`.
- [ ] Add `size-11` or equivalent 44px minimum sizing to icon-only recipe actions.
- [ ] Add `transition`, `hover`, and `focus-visible` utility classes without changing semantic colors or actions.

### Task 2: Replace the mobile menu glyph

**Files:**
- Modify: `views/partials/topBar.ejs`

**Interfaces:**
- Consumes: Existing `.sidebar-open` button and its `aria` attributes.
- Produces: A Phosphor list icon with unchanged sidebar behavior.

- [ ] Replace the literal menu glyph with `<i class="ph ph-list" aria-hidden="true"></i>`.
- [ ] Preserve `type`, `.sidebar-open`, `aria-label`, `aria-controls`, and `aria-expanded`.
- [ ] Add a 44px minimum target and visible focus state.

### Task 3: Verify the frontend-only change

**Files:**
- Test: `views/receita.ejs`, `views/partials/topBar.ejs`

- [ ] Compile the changed EJS templates with the installed `ejs` package.
- [ ] Search the changed templates for remaining action glyphs (`✎`, `�`, standalone action `+`, `?`).
- [ ] Run `npm run build:css` because Tailwind classes were changed.
- [ ] Run `git diff --check`.
- [ ] Confirm the diff contains no backend files.
