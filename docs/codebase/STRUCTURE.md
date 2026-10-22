# Codebase Structure

## 1) Top-Level Map

| Path | Purpose | Evidence |
|------|---------|----------|
| `index.js` | Ponto de entrada: Express, view engine EJS, estáticos e as 14 rotas GET | `index.js` |
| `public/js/app.js` | Cliente da API: login, token, perfil, receitas, temperatura | `public/js/app.js` |
| `public/js/script.js` | Shell da interface: sidebar, modais, senha, prévia de foto | `public/js/script.js` |
| `views/` | Templates EJS das telas, sem dados | `views/*.ejs` |
| `views/partials/` | Shell compartilhado: header, footer, sidebar, topBar, mensagens | `views/partials/*.ejs` |
| `public/css/` | Fonte Tailwind v4 (`tailwind.css`) e CSS compilado (`style.css`) | `public/css/` |
| `public/img/`, `public/icons/` | Imagens usadas pelos templates e PNGs de apoio | `public/img/`, `public/icons/` |
| `scripts/` | Verificações executadas por `npm test`, sem dependências adicionais | `scripts/codemap.md` |
| `docs/` | Documentação, planos, specs, export Figma e `docs/codebase/` | `scripts/` | Verificações executadas por `npm test`, sem dependências adicionais | `scripts/codemap.md` |
| `docs/` |
| `codemap.md`, `AGENTS.md`, `README.md` | Atlas, regras de trabalho e visão do projeto | raiz |
| `.env.example`, `.coderabbit.yaml` | Variáveis de ambiente e revisão automática | raiz |

## 2) Entry Points

- Main runtime entry: `index.js` (`"main"` e `scripts.start` em `package.json`).
- Secondary entry points (worker/cli/jobs): NONE.
- How entry is selected (script/config): `npm start` → `npx nodemon index.js`; porta de `process.env.PORT` (padrão `4000`).

Rotas registradas em `index.js` (somente GET):

| Rota | Template / destino |
|---|---|
| `/` | redirect para `/recipes` |
| `/login` | `views/login.ejs` |
| `/cadastro` | `views/cadastro.ejs` |
| `/logout` | redirect para `/login` |
| `/usuario` | `views/usuario.ejs` |
| `/configuracao`, `/configuracao/seguranca` | `views/configuracao.ejs` (salvar sem rota na API) |
| `/recipes` | `views/recipes.ejs` |
| `/recipes/:id`, `/recipes/:id/edit` | `views/recipe.ejs` |
| `/recipes/:id/temperatures/new`, `/recipes/:id/temperatures/:temperatureId/edit` | `views/temperatureForm.ejs` |
| `/lots`, `/lots/:id` | `views/lots.ejs`, `views/lot.ejs` (indisponível) |
| `/analyses/new`, `/analyses/:id` | `views/iodineDemo.ejs` (teste simulado no frontend, sem rótulo na cena), `views/analysis.ejs` (indisponível) |

## 3) Module Boundaries

| Boundary | What belongs here | What must not be here |
|----------|-------------------|------------------------|
| `index.js` | Bootstrap do Express, estáticos, rotas GET, publicação de `API_URL` | Chamadas à API, regra de negócio, sessão |
| `public/js/app.js` | Chamadas à API, token, guarda de rota, mensagens, render das listas | Regra de negócio, decisão de autorização |
| `public/js/script.js` | Comportamento visual do shell | Chamadas à API, persistência de sessão |
| `views/` | Marcação EJS, classes Tailwind, contêineres e âncoras que o cliente preenche | Dados de API, `fetch`, lógica de token |
| `views/partials/` | Shell compartilhado e carregamento de assets | Lógica específica de uma tela |
| `public/css/tailwind.css` | Tema (`--color-mash-*`), `@source` e estilos do shell | CSS gerado |
| `public/css/style.css` | Saída do build Tailwind | Edição manual |
| `scripts/` | Verificações executadas por `npm test`, sem dependências adicionais | `scripts/codemap.md` |
| `docs/` | Documentação, planos, specs e export Figma | Código de aplicação |

## 4) Naming and Organization Rules

- File naming pattern: templates em camelCase com `.ejs` (`adicionarTemperatura.ejs`, `topBar.ejs`); JavaScript em camelCase (`index.js`, `app.js`, `script.js`); CSS em kebab-case.
- Directory organization pattern: por camada de apresentação (`views/`, `views/partials/`, `public/css/`, `public/js/`, `public/img/`, `public/icons/`).
- Import aliasing or path conventions: `index.js` usa `node:` para builtins e caminhos relativos; `public/js/*.js` são scripts clássicos carregados por `<script src>` (sem `import`), na ordem definida em `views/partials/footer.ejs`: `script.js` e depois `app.js`.
- Contrato HTML↔JS por string: o cliente encontra elementos por `id`/atributo (`#formLogin`, `#listaReceitas`, `[data-user]`). Renomear um deles quebra o comportamento sem erro.

## 5) Evidence

- `package.json`
- `index.js`
- `public/js/app.js`, `public/js/script.js`
- `views/partials/footer.ejs`
- `docs/codebase/.codebase-scan.txt`
