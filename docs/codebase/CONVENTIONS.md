# Coding Conventions

## 1) Naming Rules

| Item | Rule | Example | Evidence |
|------|------|---------|----------|
| Pages | arquivo por rota, em inglês, como a URL | `src/pages/recipes/[id]/iodine.js` | `src/pages/` |
| Components | pasta PascalCase com `index.js`; telas terminam em `Content` | `RecipesContent/index.js`, `AppShell/index.js` | `src/components/` |
| Services | camelCase | `api.js`, `auth.js`, `rampa.js` | `src/services/` |
| Functions e estado | pt-BR em camelCase, verbo + alvo; componentes em PascalCase | `carregar`, `salvar`, `mensagemErro`, `LinhaRampa` | `src/components/` |
| Constants/env vars | `UPPER_SNAKE` para constantes de módulo; `NEXT_PUBLIC_*` no ambiente | `TOKEN_KEY`, `NEXT_PUBLIC_API_URL` | `src/services/api.js` |
| Rotas | inglês, minúsculas, plural nas coleções | `/recipes`, `/recipes/:id/temperatures/new` | `src/pages/` |
| Campos de formulário | os que vão para a API seguem o nome da API em camelCase (decisão de 08/10/2026, #86); ids em pt-BR | `name="minTemperatureRamp"`, `id="senha"` | `TemperatureContent`, `LoginContent` |
| Tokens de tema | `--color-*` em pt-BR por função; prefixo `mash-` só nas cores de marca | `--color-acao`, `--color-mash-brown` | `public/css/tailwind.css` |

## 2) Formatting and Linting

- Formatter: Prettier (`.prettierrc.json`). JS com 4 espaços, aspas simples, ponto e vírgula, `trailingComma: es5` e linha de até 100 caracteres; JSON e CSS com 2 espaços e aspas duplas. `.prettierignore` deixa de fora `public/css/style.css`, `package-lock.json` e `docs/`.
- Pre-commit: o `npm install` instala um hook do husky; no `git commit`, o lint-staged roda `prettier --write` nos arquivos JS, CSS, JSON e HTML do staging.
- Linter: `npm run lint` (`eslint .`) com `eslint.config.mjs`, que estende `eslint-config-next/core-web-vitals`. `react-hooks/set-state-in-effect` fica desligada porque buscar dados no `useEffect` é o padrão do projeto.
- CI: o Super-Linter (`.github/workflows/super-linter.yml`) confere ESLint, Prettier e HTMLHint nos arquivos alterados, em PR e no `main`, e nunca faz commit. O CodeQL roda pelo default setup do GitHub.
- Revisão de PR: `.coderabbit.yaml` (pt-BR, perfil `chill`), que usa o `AGENTS.md` como guia e ignora arquivos gerados.

## 3) Import and Module Conventions

- Ordem: `react`, `next/*`, depois `@/components/*` e `@/services/*`.
- Alias `@/` aponta para `src/` (`jsconfig.json`); não usar caminhos relativos entre pastas de `src/`.
- Cada componente exporta a tela como `default`; peças reaproveitadas por outras telas saem como export nomeado (`LotForm`, `useReceita`, `RecipeNameModal`, `AccessHistory`).
- Toda chamada à API passa por `api` de `src/services/api.js`.

## 4) Error and Logging Conventions

- Erros da API viram `flash('danger', mensagemErro(error, fallback))`, com a mensagem da API como veio. Erros de campo usam `Field` com `error`.
- Falha ao carregar o usuário ou a receita mostra `ServerError`; `401` é tratado só no interceptor.
- Nenhum `console.*` nas telas. Nenhum segredo no código; `.env` fica fora do versionamento.

## 5) Testing Conventions

- `scripts/verify-frontend.mjs`, com `node:test` e `node:assert/strict`, executado por `npm test`.
- Regras puras (como `validarRampa`) ficam em `src/services/` para serem importadas pelo teste sem JSX.
- Não há coleta de cobertura.

## 6) Evidence

- `package.json`, `eslint.config.mjs`, `jsconfig.json`
- `src/services/api.js`, `src/components/Feedback/index.js`
- `.prettierrc.json`, `.prettierignore`, `.husky/pre-commit`
- `.github/workflows/super-linter.yml`, `.coderabbit.yaml`
