---
name: verificar-frontend-com-api-falsa
description: >
  Verify a MASH frontend screen in the browser when the real Back-End (and its
  MySQL) is not running, by serving a tiny fake API on port 8080 and toggling its
  responses (404/200/error). Use this skill whenever you need to check how
  public/js/app.js renders a state — empty, unavailable, error, success — for a
  route the Back-End lacks or cannot run locally, even if the user only says
  "testa no navegador" or "confere a tela".
license: MIT
metadata:
  author: haimonvieira
  version: "1.0"
---

# Checking frontend states with a fake API

Run a throwaway Node stub on `:8080` that mimics the routes a screen calls, run
the frontend on `:4000`, and drive the page to see each state.

**Failure pattern:** no MySQL/API locally (`curl localhost:8080` → `000`), so the
page only shows the 503 "network" error and the real 404/200 branches are never
exercised.
**Verified by:** `/profile` card "Últimos acessos" rendered "Histórico
indisponível" with the stub answering 404 and the rows with selos with 200;
`/settings` volume `aria-valuetext` read "Baixo,Alto" via CDP.

## Procedure

- [ ] 1. Confirm the API is down: `curl -s -o /dev/null -w "%{http_code}" localhost:8080/...`
      and `ss -ltn | grep -E ':3306|:8080'`.
- [ ] 2. Write the stub in the session scratchpad (never in the repo):
      `node:http` server on 8080 that sets
      `Access-Control-Allow-Origin: http://localhost:4000` and
      `Access-Control-Allow-Headers: Authorization, Content-Type`, answers
      `OPTIONS` empty, returns `{ user: {...} }` for `/user` (the guard needs it),
      and the route under test. Add a `/modo` route that flips 404 ↔ 200.
- [ ] 3. Start both in the background: `node <scratchpad>/stub.mjs` and
      `node index.js` (frontend, port 4000).
- [ ] 4. In the browser (pencil `browser` tool or Chrome tools): load
      `http://localhost:4000/login`, run
      `localStorage.setItem('mash-token','x')` via `Runtime.evaluate`, THEN load
      the target page with a separate `load-page`.
- [ ] 5. Screenshot the element (`target:"query"`), `curl localhost:8080/modo`,
      reload, screenshot again. Use `Runtime.evaluate` for attribute checks.
- [ ] 6. Stop both background tasks before finishing.

## Gotchas

- The token is a fake string; the stub never validates it. Never put a real JWT
  or credentials in the stub.
- The response shape is a guess for routes not yet in the Swagger — say so when
  reporting; it is not validation against the real Back-End.
- AGENTS.md still requires testing with the real API before ticking the PR's
  "validação manual" item; the stub check does not count for that.

## What didn't work

- Setting the token and navigating in the same script on `/login`
  (`localStorage.setItem(...); location.href='/profile'`): the route guard sees
  the token on a public page and redirects to `/recipes` first. Set the token,
  then do a separate `load-page` to the target.
- Testing with the API simply down: every call returns the client's 503
  fallback, so the 404 "indisponível" branch never runs.
