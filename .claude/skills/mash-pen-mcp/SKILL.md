---
name: mash-pen-mcp
description: >
  Edit docs/design/mash.pen (the MASH design file) through the pencil MCP: add or
  redesign v2 screens, update the design system, fix empty space, and order the
  screens/slides for the pitch. Use this skill whenever a task touches the Pen
  file, its screens, the "Mapa de navegação", the Design System frames, or the
  presentation order, even if the user just says "no Pen", "nas telas", "slides"
  or "design".
license: MIT
metadata:
  author: haimonvieira
  version: "1.0"
---

# Editing mash.pen with the pencil MCP

How to change `docs/design/mash.pen` safely: read before writing, reuse the v2
components, verify layout, and keep the slide (layer) order in flow order.

**Failure pattern:** slides presented out of order even though the canvas looked
organized (presentation follows the document's layer list, not x/y); edits lost
because the `.pen` was never saved to disk; screens that look fine but have
stale/false layout problems or circular `fit_content` collapses.
**Verified by:** `Move(id, undefined, index)` over every top-level frame fixed the
presentation order (user confirmed "agora arrumou"); every built screen passed a
`ctx.problems` scan with 0 issues on a fresh `execute` call plus `TakeScreenshot`.

## When to use this

- Adding, copying or redesigning screens in the v2 sections (desktop 1920×1080,
  mobile 390 wide).
- Adding components to "Design System · 2 Componentes" / "· 3 Feedback e mensagens".
- Reordering screens for the pitch ("slides").

## Procedure

- [ ] 1. `get_app_state` (confirms the open file and lists components), then
      `read_skill` → `execute.md` and `pen-schema.md` once per session.
- [ ] 2. Inventory with visitors, never a bare document read:
      `Get((n,c)=>{c.skipChildren();return n})` lists top-level frames;
      `Get(id,(n,c)=>{...})` with a depth guard prints a subtree.
- [ ] 3. Build from existing v2 pieces: copy a sibling screen
      (`Copy(id, document, {name, x, y, placeholder:true})`), clear its
      "Conteúdo" children, rebuild. Reuse refs: `s4lanQ` Sidebar, `YL0sY` Header
      (`Y0NkUh`/`Mghqg` = breadcrumb), `lxXiW`/`mxUHV` mobile top bars,
      `b3O5Y7` primary, `r0l7Z` secondary, `J7waJ` danger, `KZAv0` disabled,
      `H8qgW` icon danger, `Yordf` selo, `a8mkAd` alerta, iodine components
      "Iodo / Estado da câmera", "Iodo / Resultado", "Iodo / Escala",
      "Iodo / Etapa da calibração". Tokens: `$v2-*`, `$fonte-titulo`, `$fonte-ui`.
- [ ] 4. Sidebar active item = instance overrides on the Sidebar ref
      (item fill `$v2-acao-suave`, icon `*-fill` + `$v2-foco`, text `$v2-acao` 600)
      and reset the previously active one.
- [ ] 5. Verify in a NEW `execute` call: problems scan
      `Get(id,(n,c)=>c.problems&&Print(n.name,c.problems))`, then one
      `TakeScreenshot`. Remove `placeholder` when done.
- [ ] 6. New/moved screens: check overlaps between all top-level frames
      (bounding-box test) and keep section label texts ("Seção · N") in sync.
- [ ] 7. Presentation order: `Move(id, undefined, i)` for every screen in flow
      order (desktop rows, then mobile rows, then Mapa de navegação and Design
      System). New screens land at the END of the layer list.
- [ ] 8. Tell the user to press **Ctrl+S** in Pen; confirm with
      `git status --short` that `docs/design/mash.pen` changed.

## Gotchas

- `ctx.problems` and bounds read in the SAME call that created nodes are stale;
  a clean re-check in a separate call is the real result.
- `Get(id,{depth:N})` returns elided children as the string `"..."`; to go deeper
  call `Get(childId,{depth:…})` again instead of indexing into it.
- A parent with `fit_content` height whose child uses `fill_container` collapses;
  give the parent a fixed height or make the child fixed.
- Charts: plot frames use `layout:"none"` with fixed width; after a card grows,
  rescale children (path height, grid y, markers) to the measured plot size.
- `descendants` overrides on instances (e.g. alert text) do not show up in plain
  text searches; search `n.descendants` too.
- Mobile screens taller than 844 are allowed only as `fit_content` "página com
  rolagem"; then push the next mobile row/label down so they don't overlap.
- Product rules (AGENTS.md/PRODUCT.md): no "Próximo semestre"/"dados simulados"
  labels on screens; iodine test = fixed bench camera + session calibration
  (white standard, positive and negative controls) + 3 classes (presença de
  amido, conversão parcial, ausência de amido detectável) + inconclusiva only for
  image-quality failure; never percentages. Delete buttons are filled red.

## What didn't work

- Reordering screens on the canvas (x/y) to fix slide order — presentation still
  followed the old layer list; only `Move` with an index fixed it.
- `Get(document, {depth:1})` — refused ("would return everything"); use a
  visitor with `skipChildren`.
- Hiding a node found by a broad text search hid a Design System example
  ("Alerta info") by mistake — check the ancestor chain before hiding.
- Deleting components just because no screen instances them: Modal, Painel
  inferior, Linha de tabela, Card de lista, Estado vazio and Esqueleto map to
  frontend `<template>`s and must stay; audit against the frontend first.
