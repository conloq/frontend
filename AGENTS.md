# AGENTS.md

## Project shape

- Frontend-only repository of the Sistema MASH (Projeto Integrador III, DSM3, FATEC Registro, GitHub org `conloq`): Next.js 16 (Pages Router), React 18, Tailwind CSS v4 and `axios`. The structure follows the course reference project `front-end-react`: `src/pages/` (one file per route) and `src/components/XContent/index.js` (one folder per screen).
- Two repositories, one role each. This one owns the screens; the Back-End (`conloq/Back-End`, REST on port 8080) owns business rules, application data and JWT issuance. This repository does not connect to MySQL (the old `sessions` table was dropped by the Back-End migration `20261028120000-remover-tabela-sessions`).
- The browser calls the Back-End directly through `src/services/api.js` (`axios.create` with `NEXT_PUBLIC_API_URL`). The JWT from `POST /login` is stored in `localStorage` as `mash_token`; a request interceptor sends `Authorization: Bearer`. The Back-End CORS must allow this origin (`FRONTEND_URL`, default `http://localhost:4000`).
- Contexto global portátil: [conloq/.github/PROJECT_CONTEXT.md](https://github.com/conloq/.github/blob/main/PROJECT_CONTEXT.md). Leia antes de tarefas não triviais; consulte o estado operacional ao vivo no GitHub.

## Commands and prerequisites

- Install: `npm install`
- Dev: `npm run dev` (`next dev -p 4000`). The API must be running at `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`).
- Production: `npm run build` (`build:css` + `next build`), then `npm start` (`next start -p 4000`). `NEXT_PUBLIC_*` is inlined at build time.
- Build CSS: `npm run build:css` (`tailwindcss -i public/css/tailwind.css -o public/css/style.css`); watch with `npm run watch:css`.
- Check: `npm test` runs `node --test scripts/verify-frontend.mjs` (API layer contract, auth routes, ramp validation, no `dangerouslySetInnerHTML` in screens). It needs no API or database.
- Lint: `npm run lint` (`eslint .`, flat config in `eslint.config.mjs` extending `eslint-config-next/core-web-vitals`; `react-hooks/set-state-in-effect` is off because fetching in `useEffect` is the project pattern).
- Format: `npm run format` (Prettier on `**/*.{js,mjs,css,json,html}`); `npm run format:check` only checks. Config in `.prettierrc.json` (4 spaces, single quotes; JSON and CSS 2 spaces, double quotes) and `.prettierignore` (generated CSS, `package-lock.json`, `docs/`).
- Pre-commit: `npm install` installs a husky hook (`prepare`). On `git commit`, lint-staged runs `prettier --write` on the staged JS, CSS, JSON and HTML files and adds the result to the commit. Markdown is not formatted. Use `git commit --no-verify` only to keep a commit free of unrelated formatting.
- CI: the Super-Linter (`.github/workflows/super-linter.yml`) checks ESLint, Prettier and HTMLHint on changed files in PRs and on `main`; it never commits. CodeQL runs through GitHub default setup.

## Runtime constraints

- `.env` is optional; `.env.example` documents only `NEXT_PUBLIC_API_URL`. Everything under `NEXT_PUBLIC_` reaches the browser: never put secrets there.
- Icons come from `@phosphor-icons/web` imported in `src/pages/_app.js` (`/regular` and `/fill`). Do not add a second icon delivery mechanism.
- `src/pages/_document.js` loads Google Fonts, `/css/style.css` and an inline script that applies `body.sidebar-collapsed` before first paint.
- `public/css/style.css` is committed and must be regenerated whenever Tailwind classes change.
- Node version is not pinned (no `engines`, no `.nvmrc`). Next 16 still accepts React 18 but warns that support ends in Next 17.

## Client contract

- All API access goes through `src/services/api.js` and `src/services/auth.js`. Do not create a second `axios` instance or call `fetch` to the API from components.
- On API `401` (except `POST /login`), the interceptor removes the token and sends the user to `/login`. `AppShell` redirects to `/login` without a token and calls `GET /user` before rendering a logged-in screen; the user is available through `useUser()`.
- The Back-End has no logout route: "Sair" (`a[href="/logout"]`) only removes the token.
- API messages are shown as returned, in pt-BR, through `mensagemErro(error, fallback)` (`data.error ?? data.message ?? fallback`). The login `400` responds in `message`; other errors use `error`.
- Messages render in `#mensagens` through `flash(tipo, texto)` (`src/components/Feedback`), which also survives one `router.push` via `sessionStorage`. Passwords are never flashed or stored.
- React escapes rendered values; never use `dangerouslySetInnerHTML` with API data (the only use is the static sidebar script in `_document.js`).
- Destructive actions use `ConfirmDialog` (`#dialogoConfirmar`), never `window.confirm()`. Field errors use `Field` with `error` (`.campo-erro`, `[data-campo]`, `[data-erro]`).

## UI changes

- Bootstrap has been removed. Use Tailwind utilities; do not reintroduce Bootstrap CDNs, `data-bs-*` attributes or Bootstrap classes.
- Preserve the route URLs and the ids/attributes kept from the design: `#formLogin`, `#formCadastro`, `#formPerfil`, `#formFoto`, `#formReceita`, `#formEditarReceita`, `#formTemperatura`, `#listaReceitas`, `#listaAcessos`, `#formLote`, `#loteReceita`, `#formIodoReceita`, `#iodoReceitaLink`, `#formRecuperar`, `#detalheRampas`, `#mensagens`, `#dialogoConfirmar`, `#btnExcluir`, `#btnSalvar`, `#btnDescartar`, `#inputFoto`, `#previewFoto`, `#senha`, `data-campo`, `data-erro`, `data-sem-api`, `data-toggle-senha`, `a[href="/logout"]`.
- The shell is `src/components/AppShell`: `#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link`, `.menu-link-active`. Desktop collapses the sidebar (18rem/5rem); the choice is written to `localStorage` as `mash-sidebar-collapsed` only when the user toggles it, so it survives navigation and reload. Mobile uses the top-bar drawer plus overlay. Keep touch targets at 44px minimum.
- Use only honest visual states. Do not invent successful API calls or persistence to make a screen look finished. The client calls only routes that exist in the Back-End `main`. Lots, the dashboard, the iodine session and password recovery have no API route in the current scope: `/dashboard`, `/lots*` (list, new, detail, edit, monitoring), `/lots/:id/iodine*` and `/forgot-password*` show the full layout with honest empty states (`EmptyState`, never sample data) and `data-sem-api` forms (`conloq/mash#31`, `#1`, `#3`, `#73`); the lot form only reads real recipes from `GET /recipes`. Analysis detail (`/analyses/:id`) shows an empty state too. `/analyses/new` (`IodineDemoContent`) is a frontend simulation with fake data; real image upload, storage, OpenCV analysis, query and history stay in Backlog for next semester, without a Sprint (`conloq/mash#34` and related issues). The iodine-test scene is mandatory in the pitch (`#25`, `#28`) and must use the frontend simulation without a simulation label in the scene. Editing and deleting ramps wait for `conloq/mash#97`; saving and deleting remain `data-sem-api`. Exception decided on 22/10/2026: `data-sem-api` actions (ramp edit and delete, Configuração "Salvar alterações") stay enabled and only block the submit, with no "Ainda sem rota na API" message; do not reintroduce that alert or banner. The one exception to "existing routes only" is `GET /user/login-history` (`conloq/mash#102`), called ahead of the Back-End by the Perfil card "Últimos acessos": a `404` is treated as an empty list ("Nenhum acesso registrado"), never sample rows. Screens never tell the user that the API, a route or a feature is missing or in development.
- Visual source: `docs/design/mash.pen` (redesign v2 and design system) and the Figma export of its screens. Tokens are in `public/css/tailwind.css` (`@theme`); reuse the component classes (`btn-primario`, `btn-secundario`, `btn-perigo`, `btn-fantasma`, `btn-voltar` (back links only), `acoes`, `btn-icone`, `campo*`, `card`, `selo-*`, `tabela-*`, `esqueleto`, `interruptor`, `segmentado`, `deslizante`) and the shared components in `src/components/Feedback` instead of new one-off styles.

## Verification

- Before claiming a change works, run `npm test`, `npm run lint`, `npm run format:check`, `npm run build:css` when classes changed, and `npm run build`.
- Run `next build` from the repository root; run from `src/` it creates a stray `src/.next`.
- For behaviour, run MySQL, the Back-End (`npm start` in `conloq/Back-End`, which applies the migrations) on 8080 and this app on 4000, and exercise the flow in a browser at desktop and mobile widths.
- Stop any server started for verification.
- Do not run destructive Git commands, edit `node_modules/`, or commit generated artifacts other than `public/css/style.css` when its source changed.

## Pull requests

- Before `gh pr create` or editing a PR body, read the effective PR template from the base branch: the repository's own `.github/pull_request_template.md` first; only when it does not exist, the organization one in `conloq/.github` (`gh api repos/conloq/.github/contents/.github/pull_request_template.md -q .content | base64 -d`). Never open a PR with a free-form `--body`.
- Keep every section and DoD item verbatim, written in pt-BR. Tick only the items that apply; leave N/A items unticked with a short note. Use `Closes conloq/mash#N` (or `Fixes` for a bug), or "Relacionada a" for a partial delivery.
- No `Co-Authored-By` and no "Generated with" line in commits or PR bodies. `gh pr edit` fails on this account (Projects classic GraphQL error): edit the body with `gh api -X PATCH repos/<owner>/<repo>/pulls/<n> -F body=@file`.
- Full procedure: skill `coordenacao-commit-seguro` (coordination repo).

## Source of truth

- Treat `package.json` scripts, `src/services/`, `src/components/` and `src/pages/` as authoritative over stale documentation.
- `codemap.md` is the repository atlas; read it before non-trivial work. The seven files in `docs/codebase/` describe this repository.
- Keep them current: when a change adds, removes or renames files, routes, components, tokens, scripts or tooling, update the matching `codemap.md` (root and that folder's) and the affected `docs/codebase/` file in the same PR. A codemap that lists files that no longer exist is a bug.
- Ignore documents that describe the legacy monolith `conloq/mash` or the EJS version of this frontend (`index.js`, `controllers/pageController.js`, `views/`, `public/js/`) as current; `docs/evidence/` and `docs/superpowers/` are historical records of that version.

## Repository Map

A full codemap is available at `codemap.md` in the project root.

Before working on any task, read `codemap.md` to understand:
- Project architecture and entry points
- Directory responsibilities and design patterns
- Data flow and integration points between modules

For deep work on a specific folder, also read that folder's `codemap.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
