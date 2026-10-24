# Codebase Structure

## 1) Top-Level Map

| Path | Purpose | Evidence |
|------|---------|----------|
| `index.js` | Ponto de entrada: Express, sessão, view engine EJS e estáticos | `index.js` |
| `controllers/pageController.js` | Rotas de página, chamadas server-side à API, sessão e POSTs de formulário | `controllers/pageController.js` |
| `public/js/app.js` | Validações e interações do navegador; sem JWT ou chamadas à API | `public/js/app.js` |
| `public/js/script.js` | Shell da interface: sidebar, modais, senha, prévia de foto | `public/js/script.js` |
| `views/` | Templates EJS; telas MASH e exemplo de renderização server-side | `views/*.ejs` |
| `views/partials/` | Shell compartilhado: header, footer, sidebar, topBar, mensagens | `views/partials/*.ejs` |
| `public/css/` | Fonte Tailwind v4 (`tailwind.css`) e CSS compilado (`style.css`) | `public/css/` |
| `public/img/` | Imagens usadas pelos templates | `public/img/` |
| `scripts/` | Verificações executadas por `npm test`, sem dependências adicionais | `scripts/codemap.md` |
| `docs/` | Documentação, planos, specs, export Figma e `docs/codebase/` | `docs/` |
| `codemap.md`, `AGENTS.md`, `README.md` | Atlas, regras de trabalho e visão do projeto | raiz |
| `.env.example`, `.coderabbit.yaml` | Variáveis de ambiente e revisão automática | raiz |

## 2) Entry Points

- Main runtime entry: `index.js` (`"main"` e `scripts.start` em `package.json`).
- Secondary entry points (worker/cli/jobs): NONE.
- How entry is selected (script/config): `npm start` → `nodemon index.js`; porta de `process.env.PORT` (padrão `4000`).

Rotas de página registradas por `controllers/pageController.js`:

| Rota | Template / destino |
|---|---|
| `/` | redirect para `/dashboard` |
| `/login` | `views/login.ejs` |
| `/signup` | `views/signup.ejs` |
| `/logout` | redirect para `/login` |
| `/profile` | `views/profile.ejs` |
| `/settings`, `/settings/security` | `views/settings.ejs` (salvar sem rota na API) |
| `/recipes` | `views/recipes.ejs` |
| `/recipes/:id`, `/recipes/:id/edit` | `views/recipe.ejs` (`/edit` abre o modal de renomear) |
| `/recipes/:id/iodine` | `views/recipeIodine.ejs` (salvar sem rota na API) |
| `/recipes/:id/temperatures/new`, `/recipes/:id/temperatures/:temperatureId/edit` | `views/temperatureForm.ejs` |
| `/forgot-password`, `/forgot-password/code`, `/forgot-password/reset` | `views/forgotPassword.ejs` (sem rota na API) |
| `/dashboard` | `views/dashboard.ejs` (estado vazio) |
| `/dw2-example` | `views/dw2Example.ejs` (lista estática passada por `res.render`, renderizada com loop EJS) |
| `/lots`, `/lots/:id`, `/lots/:id/monitoring` | `views/lots.ejs`, `views/lot.ejs`, `views/lotMonitoring.ejs` (estado vazio) |
| `/lots/new`, `/lots/:id/edit` | `views/lots.ejs` / `views/lot.ejs` com o modal `partials/modalLote.ejs` aberto (salvar sem rota na API) |
| `/lots/:id/iodine`, `/lots/:id/iodine/reading` | `views/iodineSession.ejs` (câmera desconectada, estado vazio) |
| `/analyses/new`, `/analyses/:id` | `views/iodineDemo.ejs` (teste simulado no frontend, sem rótulo na cena), `views/analysis.ejs` (indisponível) |

## 3) Module Boundaries

| Boundary | What belongs here | What must not be here |
|----------|-------------------|------------------------|
| `index.js` | Bootstrap do Express, sessão, estáticos e montagem das rotas de página | Chamadas por tela à API, regra de negócio |
| `controllers/pageController.js` | Leituras, autenticação de página, dados para EJS e adaptação dos POSTs para a API | Regras de negócio, banco |
| `public/js/app.js` | Interações e validações de interface | JWT, chamadas à API, autorização |
| `public/js/script.js` | Comportamento visual do shell | Chamadas à API, persistência de sessão |
| `views/` | Marcação EJS, classes Tailwind, apresentação de dados e estados recebidos como locals | Chamadas à API, lógica de token |
| `views/partials/` | Shell compartilhado e carregamento de assets | Lógica específica de uma tela |
| `public/css/tailwind.css` | Tema (`--color-mash-*`), `@source` e estilos do shell | CSS gerado |
| `public/css/style.css` | Saída do build Tailwind | Edição manual |
| `scripts/` | Verificações executadas por `npm test`, sem dependências adicionais | `scripts/codemap.md` |
| `docs/` | Documentação, planos, specs e export Figma | Código de aplicação |

## 4) Naming and Organization Rules

- File naming pattern: templates em camelCase com `.ejs` (`temperatureForm.ejs`, `topBar.ejs`); JavaScript em camelCase (`index.js`, `app.js`, `script.js`); CSS em kebab-case.
- Directory organization pattern: por camada de apresentação (`views/`, `views/partials/`, `public/css/`, `public/js/`, `public/img/`).
- Import aliasing or path conventions: `index.js` usa `node:` para builtins e caminhos relativos; `public/js/*.js` são scripts clássicos carregados por `<script src>` (sem `import`), na ordem definida em `views/partials/footer.ejs`: `script.js` e depois `app.js`.
- Contrato HTML↔JS por string: o cliente encontra elementos por `id`/atributo (`#formPerfil`, `#listaReceitas`, `#detalheRampas`). Renomear um deles quebra o comportamento sem erro.

## 5) Evidence

- `package.json`
- `index.js`
- `public/js/app.js`, `public/js/script.js`
- `views/partials/footer.ejs`
- `docs/codebase/.codebase-scan.txt`
