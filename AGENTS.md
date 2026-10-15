# AGENTS.md

## Project shape

- Frontend-only repository of the Sistema MASH (Projeto Integrador III, DSM3, FATEC Registro, GitHub org `conloq`): EJS templates, Tailwind CSS v4 and vanilla browser JavaScript.
- Two repositories, one role each. This one has screens only; the Back-End (`conloq/Back-End`, REST on port 8080) owns business rules, database and JWT.
- `index.js` is the runtime entrypoint on port 4000. It renders pages and serves static assets: **it never calls the API**. Each screen is a `GET` route that runs `res.render(view)`, with no data.
- The browser consumes the API directly, in `public/js/app.js`, with `fetch` against the Back-End routes (`/login`, `/user`, `/receitas`...). The Back-End allows CORS for `http://localhost:4000`.
- The JWT lives in `localStorage` under `mash-token` and is sent as `Authorization: Bearer`. There is no server session and no cookie.
- Node.js ES modules (`"type": "module"`) with Express 5, EJS 5, Tailwind CSS v4, Nodemon and Phosphor Icons. No database, ORM, session, auth or upload handling here.

## Commands and prerequisites

- Install: `npm install`
- Start: `npm start` (`npx nodemon index.js`) on port 4000 (default; override with `PORT`). The API must be running at `API_URL` (default `http://localhost:8080`).
- Build CSS: `npm run build:css` (`npx @tailwindcss/cli -i public/css/tailwind.css -o public/css/style.css`)
- Watch CSS: `npm run watch:css`
- Check syntax: `npm test`: only `node --check index.js`. There is no test, lint, formatter or typecheck suite.
- Focused checks: `node --check <file>.js`, compile EJS templates with the installed `ejs` package, and rerun `npm run build:css` after changing classes or `@source` directives.

## Runtime constraints

- `index.js` registers only `GET` routes; every one calls `res.render`. All mutations happen in the browser via `public/js/app.js` against the API.
- `API_URL` is exposed to the page as `window.API_URL` by `views/partials/footer.ejs` (`<%- JSON.stringify(apiUrl) %>`, with `<` escaped). `public/js/app.js` reads it once at load: do not reassign `window.API_URL` at runtime and expect the client to follow.
- `index.js` calls `process.loadEnvFile()` inside `try/catch`, so `.env` is optional. `.env.example` documents `PORT` and `API_URL`.
- `/vendor/phosphor` is mounted from `node_modules/@phosphor-icons/web`; `views/partials/header.ejs` loads `/vendor/phosphor/src/regular/style.css`. Do not add a second icon delivery mechanism.
- `public/css/style.css` is committed and must be regenerated whenever Tailwind classes change.
- Node version is not pinned (no `engines`, no `.nvmrc`).

## Client contract (`public/js/app.js`)

The whole client is one IIFE. Keep these boundaries when editing:

- `api(metodo, caminho, corpo)` never throws: it returns `{ status, data }`. On network failure it returns `{ status: 503 }` with a pt-BR message. Use it for every API call instead of raw `fetch`.
- A `401` with a token present clears the token and redirects to `/login`.
- The route guard runs at load: public pages are `/login` and `/cadastro`. Without a token, other pages redirect to `/login`; with a token, public pages redirect to `/receitas`.
- API messages are shown as returned, in pt-BR, read as `data.error ?? data.message ?? <fallback>`. The login `400` responds in `message`; other errors use `error`.
- `escapar(texto)` neutralises HTML **and** quotes, because values are interpolated into attributes (`href`, `data-excluir`). Do not replace it with plain `textContent`/`innerHTML` or with raw template interpolation.
- Messages that must survive a redirect go through `localStorage` (`mash-flash`) via `irPara(url, tipo, texto)`.

## UI changes

- Bootstrap has been removed. Use Tailwind utilities and the existing vanilla JS; do not reintroduce Bootstrap CDNs, `data-bs-*` attributes or Bootstrap classes.
- Preserve the EJS partial composition, route URLs, and the ids/attributes the client binds to: `#formLogin`, `#formCadastro`, `#formPerfil`, `#formFoto`, `#formReceita`, `#formTemperatura`, `#listaReceitas`, `#mensagens`, `#btnExcluir`, `#btnAlterar`, `#btnSalvar`, `#inputFoto`, `#previewFoto`, `#senha`, `data-user`, `data-excluir`, `a[href="/logout"]`.
- The shell is handled by `public/js/script.js`, which needs `#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link`, `.js-modal`, `[data-modal-open]` and `[data-modal-close]`. Desktop collapses the sidebar (18rem/5rem, persisted in `localStorage` as `mash-sidebar-collapsed`); mobile uses the top-bar drawer plus overlay. Keep touch targets at 44px minimum.
- Use only honest visual states. Do not invent successful API calls or persistence to make a screen look finished. Iodine screens and `editarTemperatura` have no API route yet and are layout only (`conloq/mash#73`).

## Verification

- Before claiming a change works, run `npm test`, `node --check` on changed JS, an EJS compile of touched templates, and `npm run build:css` when classes changed.
- For behaviour, run both servers (API on 8080, this on 4000) and exercise the flow in a browser at desktop and mobile widths.
- Stop any server started for verification.
- Do not run destructive Git commands, edit `node_modules/`, or commit generated artifacts other than `public/css/style.css` when its source changed.

## Source of truth

- Treat `package.json` scripts, `index.js`, `public/js/app.js` and the current templates as authoritative over stale documentation.
- `codemap.md` is the repository atlas; read it before non-trivial work. The seven files in `docs/codebase/` describe this repository.
- Ignore any document that describes `config/`, `routes/`, `controller/`, `middleware/`, `models/`, `services/`, MySQL, Sequelize, sessions, bcrypt or Multer as part of this repository: that is the legacy monolith `conloq/mash`, kept in the coordination repo `haimonvieira/conloq-pi-coordenacao` (local `D:/Fatec/PI/team-lead`).

## Repository Map

A full codemap is available at `codemap.md` in the project root.

Before working on any task, read `codemap.md` to understand:
- Project architecture and entry points
- Directory responsibilities and design patterns
- Data flow and integration points between modules

For deep work on a specific folder, also read that folder's `codemap.md`.
