# Repository Atlas: frontend (Sistema MASH)

## Project Responsibility

Frontend do Sistema MASH (Projeto Integrador III, DSM3, FATEC Registro, org `conloq`): Next.js 16 (Pages Router) com React 18 e Tailwind CSS v4, na porta 4000.

Dois repositórios, um papel cada: este tem as telas; o Back-End (`conloq/Back-End`, API REST na porta 8080) tem regra de negócio, dados e emite o JWT. O navegador chama a API direto com `axios` e Bearer, no padrão do projeto de referência `front-end-react`. O frontend não conecta ao banco.

## System Entry Points

- `src/pages/_app.js`: carrega os ícones Phosphor (`@phosphor-icons/web/regular` e `/fill`).
- `src/pages/_document.js`: `<head>` com Google Fonts, `/css/style.css` (Tailwind gerado) e o script que aplica a sidebar recolhida antes da primeira pintura.
- `src/services/api.js`: instância `axios` (`NEXT_PUBLIC_API_URL`), interceptor que envia `Authorization: Bearer`, tratamento do `401` e `mensagemErro()` (`data.error ?? data.message ?? padrão`).
- `src/services/auth.js`: `signIn` (`POST /login`, guarda `mash_token`), `signUp` (`POST /user`), `currentUser` (`GET /user`) e `signOut`.
- `src/services/rampa.js`: validação pura da rampa de temperatura (mesmas regras da API), testada em `npm test`.
- `package.json`: scripts `dev`/`start` (porta 4000), `build` (CSS + `next build`), `build:css`, `watch:css`, `test`, `lint`, `format`.
- `.env.example`: `NEXT_PUBLIC_API_URL`.
- `public/css/tailwind.css`: entrada do Tailwind v4 (`@source "../../src"`), tokens e classes de componente.

### Rotas de tela (`src/pages/`)

| Rota | Componente | Chamadas à API |
|---|---|---|
| `/` | - | redireciona para `/dashboard` |
| `/login`, `/signup` | `LoginContent`, `SignupContent` em `AuthLayout` | `POST /login`, `POST /user` |
| `/forgot-password`, `/code`, `/reset` | `ForgotPasswordContent` (`etapa`) | nenhuma (conloq/mash#73); `data-sem-api` |
| `/dashboard` | `DashboardContent` | só `GET /user` do shell; cards em estado vazio |
| `/profile` | `ProfileContent` | `PUT /user`, `PUT /user/upload`, `DELETE /user`, `GET /user/login-history` (404 = lista vazia, conloq/mash#102) |
| `/profile/access-history` | `AccessHistory` | `GET /user/login-history` |
| `/settings`, `/settings/security` | `SettingsContent` | nenhuma; salvar só bloqueia o envio |
| `/recipes` | `RecipesContent` | `GET`/`POST /recipes`, `DELETE /recipes/:id`, `GET /recipes/:id/temperatures` por receita |
| `/recipes/:id`, `/recipes/:id/edit` | `RecipeContent` (`edit` abre o modal Renomear) | `GET`/`PUT`/`DELETE /recipes/:id`, `GET /recipes/:id/temperatures` |
| `/recipes/:id/iodine` | `RecipeIodineContent` | receita e rampas; salvar é `data-sem-api` (conloq/mash#101) |
| `/recipes/:id/temperatures/new` | `TemperatureContent` | `POST /recipes/:id/temperatures` |
| `/recipes/:id/temperatures/:temperatureId/edit` | `TemperatureContent` | leitura das rampas; salvar e excluir são `data-sem-api` (conloq/mash#97) |
| `/lots`, `/lots/new` | `LotsContent` (`form` abre `LotForm`) | `GET /recipes` no seletor; salvar é `data-sem-api` (conloq/mash#31) |
| `/lots/:id`, `/lots/:id/edit` | `LotDetail` (`editando` abre `LotForm`) | nenhuma; estado vazio |
| `/lots/:id/monitoring` | `LotMonitoring` | nenhuma; estado vazio |
| `/lots/:id/iodine`, `/lots/:id/iodine/reading` | `IodineSession` (`leitura`) | nenhuma; câmera desconectada (conloq/mash#34) |
| `/analyses/new` | `IodineDemoContent` | nenhuma; simulação do teste de iodo, sem rótulo de simulação (conloq/mash#9) |
| `/analyses/:id` | página própria | nenhuma; estado vazio |

## Repository Directory Map

| Directory | Responsibility Summary | Detailed Map |
|---|---|---|
| `src/pages/` | Uma página por rota; cada uma só monta o componente da tela. | esta tabela |
| `src/components/` | Uma pasta por tela (`XContent/index.js`) e os compartilhados: `AppShell` (sidebar, top bar, guarda de sessão, `useUser`), `AuthLayout`, `Feedback` (mensagens, `EmptyState`, `Modal`, `ConfirmDialog`, `Field`, `PasswordInput`). | - |
| `src/services/` | Acesso à API e regras puras. | - |
| `public/` | CSS (fonte e gerado) e imagens. | [public/codemap.md](public/codemap.md) |
| `public/css/` | Fonte Tailwind v4 e CSS compilado. | [public/css/codemap.md](public/css/codemap.md) |
| `scripts/` | `verify-frontend.mjs` (`npm test`). | [scripts/codemap.md](scripts/codemap.md) |
| `docs/` | Design (`docs/design/mash.pen`), documentação de telas e componentes, evidências e docs de codebase. | `docs/frontend-screens.md`, `docs/frontend-components.md`, `docs/frontend-figma.md` |

Arquivos na raiz: `package.json`, `next.config.mjs`, `eslint.config.mjs`, `jsconfig.json` (alias `@/` → `src/`), `.env.example`, `README.md`, `AGENTS.md`, `PRODUCT.md`, `.coderabbit.yaml`, este `codemap.md`.

## Runtime Flow

1. `npm run dev` sobe o Next na porta 4000; a API precisa estar em `NEXT_PUBLIC_API_URL`.
2. Login: `signIn` chama `POST /login` e grava o JWT em `localStorage` (`mash_token`).
3. Telas logadas usam `AppShell`, que sem token manda para `/login` e com token chama `GET /user` antes de mostrar a página. O usuário fica em `useUser()`.
4. Cada tela chama a API no `useEffect` ou nos handlers de formulário, com Bearer pelo interceptor.
5. `401` em qualquer rota autenticada apaga o token e vai para `/login`. Outros erros mostram a mensagem da API em `#mensagens`.
6. Mensagens que precisam sobreviver a uma navegação usam `flash()` (`sessionStorage`); a tela seguinte mostra em `#mensagens`.
7. Sair (`a[href="/logout"]`) só apaga o token: o Back-End não tem rota de logout e o JWT não é revogado.
8. `npm run build:css` compila `public/css/tailwind.css` em `public/css/style.css`, carregado pelo `_document.js`.

## Cross-Module Integration

- **Back-End:** chamadas em `src/services/` e nos componentes. Rotas em `Back-End/routes/` (`userRoutes.js`, `recipeRoutes.js`, `temperatureRoutes.js`). O CORS do Back-End libera `FRONTEND_URL` (padrão `http://localhost:4000`) e os cabeçalhos `Content-Type` e `Authorization`.
- **Nomes de campo:** JSON em camelCase (`phone`, `urlImage`, `minTemperatureRamp`, `idealTime`, `orderRamp`), conloq/mash#71 e #86.
- **Shell:** `AppShell` mantém os ids e classes do design: `#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link`, `.menu-link-active`; o estado recolhido fica em `localStorage` (`mash-sidebar-collapsed`) e na classe `body.sidebar-collapsed`.
- **Tailwind:** `@source "../../src"`; tokens `--color-*` e classes de componente (`btn-*`, `campo*`, `card`, `selo-*`, `tabela-*`, `esqueleto`, `interruptor`, `segmentado`, `deslizante`), detalhes em `public/css/codemap.md`.
- **Coordenação:** `haimonvieira/conloq-pi-coordenacao` guarda o estado do projeto.

## Scope Exclusions

Este atlas documenta o código verificável deste repositório. Ficam fora: `node_modules/`, `.next/`, `public/css/style.css` (saída gerada), `.git/` e `docs/**` como fonte de arquitetura. Banco e emissão de JWT vivem em `conloq/Back-End`.
