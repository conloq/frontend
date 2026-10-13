# Testing Patterns

## 1) Test Stack and Commands

- Primary test framework: NONE — não existe framework de testes no repositório.
- Assertion/mocking tools: NONE.
- Commands:

```bash
npm test                        # node --check index.js — sai com 0; é só verificação sintática
node --check public/js/app.js
npm run build:css               # também falha se @source/@import do Tailwind estiver inválido
npm start                       # requer a API em API_URL para as telas mostrarem dados
```

Compilação de templates EJS pode ser feita pontualmente com o pacote `ejs` já instalado:

```bash
node -e 'import("ejs").then(({default:ejs})=>{const fs=require("node:fs");for(const f of ["views/receita.ejs"]){ejs.compile(fs.readFileSync(f,"utf8"),{filename:f});console.log("OK "+f)}})'
```

## 2) Test Layout

- Test file placement pattern: NONE.
- Naming convention: NONE.
- Setup files and where they run: NONE.

## 3) Test Scope Matrix

| Scope | Covered? | Typical target | Notes |
|-------|----------|----------------|-------|
| Unit | no | `public/js/app.js`, `index.js` | Sem runner; exigiria adicionar framework |
| Integration | no | `api()` contra o Back-End | Verificado apenas por smoke manual |
| E2E | no | Login → receitas → temperatura | Sem Playwright/Cypress no repositório |

## 4) Mocking and Isolation Strategy

- Main mocking approach: NONE no repositório. Durante a revisão do PR #4, a validação do caminho "200 sem token" foi feita com um servidor stub temporário em `node:http` e `window.API_URL` fixado por `addInitScript` — recurso descartado depois, não faz parte do código.
- Isolation guarantees: N/A.
- Common failure mode: o contrato HTML↔JS quebra sem erro visível, porque o cliente usa `?.` e simplesmente não liga o handler quando o seletor não existe.

## 5) Coverage and Quality Signals

- Coverage tool + threshold: NONE.
- Current reported coverage: NONE. O CodeRabbit reporta cobertura de docstring (62,5%, limite 80%) no diff do PR #4 — não é cobertura de teste.
- Known gaps: nenhum teste cobre renderização das 10 rotas, presença dos assets (`/css/style.css`, `/js/app.js`, `/vendor/phosphor/...`), o contrato de `data-*`, nem a sincronia entre `public/css/tailwind.css` e `public/css/style.css`.
- Verificação registrada (2026-10-13, revisão do PR #4): `npm test` exit 0; `node --check` em `index.js` e `public/js/app.js` OK; 10 rotas GET responderam 200; `/css/style.css`, `/js/script.js`, `/js/app.js` e `/vendor/phosphor/src/regular/style.css` responderam 200; `npm run build:css` produziu saída idêntica a `public/css/style.css`.
- Verificação de comportamento (2026-10-13, contra a API real): login com senha errada exibe a mensagem da API; `/receitas/temperatura/cadastrar/abc` exibe "Receita inválida" sem chamar a API; `/999` devolve o erro da API; receita com `"` e `<b>` no nome renderiza escapada; `PUT`/`DELETE` de receita retornam 204 e limpam a lista.

## 6) Evidence

- `package.json`
- `index.js`
- `public/js/app.js`
- `public/css/tailwind.css`
- `docs/codebase/.codebase-scan.txt`
