# Codebase Structure

## 1) Top-Level Map

| Path | Purpose |
|------|---------|
| `src/pages/` | Uma página por rota (Pages Router), mais `_app.js` (ícones) e `_document.js` (fontes, CSS, script da sidebar) |
| `src/components/` | Uma pasta por tela (`XContent/index.js`) e os componentes compartilhados (`AppShell`, `AuthLayout`, `Feedback`) |
| `src/services/` | `api.js`, `auth.js` e `rampa.js` |
| `public/css/` | Fonte Tailwind v4 (`tailwind.css`) e CSS compilado (`style.css`) |
| `public/img/` | Imagens da marca, avatar padrão e fundo da recuperação de senha |
| `scripts/` | `verify-frontend.mjs`, executado por `npm test` |
| `docs/` | Design (`mash.pen`), documentação de telas, evidências e `docs/codebase/` |
| `codemap.md`, `AGENTS.md`, `README.md`, `PRODUCT.md` | Atlas, regras de trabalho e visão do projeto |
| `next.config.mjs`, `eslint.config.mjs`, `jsconfig.json`, `.env.example` | Configuração |

## 2) Entry Points

- `npm run dev` → `next dev -p 4000`; `npm start` → `next start -p 4000` depois de `npm run build`.
- Não há worker, CLI nem job.

| Rota | Componente |
|---|---|
| `/` | redireciona para `/dashboard` |
| `/login`, `/signup` | `LoginContent`, `SignupContent` (em `AuthLayout`) |
| `/forgot-password`, `/forgot-password/code`, `/forgot-password/reset` | `ForgotPasswordContent` (`etapa`) |
| `/dashboard` | `DashboardContent` |
| `/profile`, `/profile/access-history` | `ProfileContent`, `AccessHistory` |
| `/settings`, `/settings/security` | `SettingsContent` (`seguranca`) |
| `/recipes` | `RecipesContent` |
| `/recipes/:id`, `/recipes/:id/edit` | `RecipeContent` (`edit` abre o modal Renomear) |
| `/recipes/:id/iodine` | `RecipeIodineContent` |
| `/recipes/:id/temperatures/new`, `/recipes/:id/temperatures/:temperatureId/edit` | `TemperatureContent` |
| `/lots`, `/lots/new` | `LotsContent` (`form` abre `LotForm`) |
| `/lots/:id`, `/lots/:id/edit` | `LotDetail` (`editando` abre `LotForm`) |
| `/lots/:id/monitoring` | `LotMonitoring` |
| `/lots/:id/iodine`, `/lots/:id/iodine/reading` | `IodineSession` (`leitura`) |
| `/analyses/new` | `IodineDemoContent` |
| `/analyses/:id` | página própria com estado vazio |

## 3) Module Boundaries

| Boundary | What belongs here | What must not be here |
|----------|-------------------|------------------------|
| `src/pages/` | Montar o componente da rota e passar props de variação | Busca de dados, marcação de tela |
| `src/components/XContent/` | Estado, chamadas à API pela camada de serviço, formulários e marcação da tela | Instância própria de `axios`, URL da API |
| `src/components/AppShell` | Sidebar, top bar, guarda de sessão, `useUser()` | Lógica de uma tela |
| `src/components/Feedback` | Peças visuais e de mensagem reaproveitadas | Chamadas à API |
| `src/services/` | Cliente HTTP, autenticação e regras puras | JSX, estado de tela |
| `public/css/tailwind.css` | Tema, `@source` e classes de componente | CSS gerado |
| `public/css/style.css` | Saída do build Tailwind | Edição manual |
| `docs/` | Documentação e design | Código de aplicação |

## 4) Naming and Organization Rules

- Telas em `src/components/<Nome>Content/index.js`; compartilhados sem o sufixo.
- Imports com o alias `@/` (`jsconfig.json`).
- Os ids e atributos herdados do design (`#formPerfil`, `#listaReceitas`, `#detalheRampas`, `#mensagens`, `#appSidebar`) ficam estáveis; a lista completa está no `AGENTS.md`.
