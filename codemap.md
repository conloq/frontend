# Repository Atlas: frontend (Sistema MASH)

## Project Responsibility

Frontend do Sistema MASH (Projeto Integrador III, DSM3, FATEC Registro, org `conloq`): templates EJS, Tailwind CSS v4 e JavaScript vanilla do navegador, entregues por um `index.js` na porta 4000.

Dois repositórios, um papel cada: este tem telas e apresentação; o Back-End (`conloq/Back-End`, API REST na porta 8080) tem regra de negócio, dados de domínio e emite JWT. `controllers/pageController.js` busca dados no servidor e usa `res.render(view, locals)`, como nas views de DW2. Formulários fazem POST a rotas do frontend, que chamam a API e redirecionam. A sessão Express e o JWT ficam na tabela `sessions` do mesmo MySQL, com uma conta frontend limitada a essa tabela.

## System Entry Points

- `index.js`: Express/EJS, sessão, arquivos estáticos e montagem do controller. Escuta em `PORT` (padrão 4000); `.env` é opcional.
- `controllers/pageController.js`: rotas GET/POST das telas, login/cadastro/logout, chamadas server-side à API, locals EJS e flash de sessão.
- `public/js/app.js`: interações da interface, validação dos formulários e visuais derivados; não guarda JWT nem chama a API.
- `package.json`: runtime ESM; scripts `start` (`nodemon index.js`), `build:css`, `watch:css` e `test` (sintaxe do servidor e verificações de perfil, upload e regressões do cliente).
- `.env.example`: `PORT`, `API_URL`, `SESSION_SECRET` e `SESSION_DB_*`.
- `public/css/tailwind.css`: entrada do Tailwind v4 e fonte das classes usadas nos templates e no JS.
- `views/partials/header.ejs`: `<head>` compartilhado que carrega `/vendor/phosphor/src/regular/style.css` e `/css/style.css`.

### Rotas de tela (`controllers/pageController.js`)

| Rota GET | Template | Dados do Back-End buscados pelo controller |
|---|---|---|
| `/` | - | redireciona para `/dashboard` |
| `/dw2-example` | `dw2Example.ejs` | nenhuma; exemplo didático de `res.render` com lista estática percorrida pelo EJS |
| `/login` | `login.ejs` | POST `/login` no servidor |
| `/signup` | `signup.ejs` | POST `/user` no servidor |
| `/logout` | - | destrói a sessão e redireciona para `/login` |
| `/profile` | `profile.ejs` | `GET /user`, `/user/login-history`; dados passados como `user` e `acessos` |
| `/profile/access-history` | `accessHistory.ejs` | `GET /user`, `/user/login-history` |
| `/settings`, `/settings/security` | `settings.ejs` (`aba`) | nenhuma; salvar usa `data-sem-api` |
| `/recipes` | `recipes.ejs` | `GET /user`, `/recipes` e temperaturas de cada receita |
| `/recipes/:id`, `/recipes/:id/edit` | `recipe.ejs` | usuário, `/recipes/:id` e rampas; `/edit` abre modal |
| `/recipes/:id/iodine` | `recipeIodine.ejs` | usuário, receita e rampas |
| `/recipes/:id/temperatures/new` | `temperatureForm.ejs` | usuário e receita |
| `/recipes/:id/temperatures/:temperatureId/edit` | `temperatureForm.ejs` (`editando`) | usuário, receita e temperatura |
| `/forgot-password`, `/forgot-password/code`, `/forgot-password/reset` | `forgotPassword.ejs` (`etapa`) | nenhuma; páginas públicas (barra da marca, espuma `img/espuma.png` e card central no desktop; código em 6 caixas e contagem do "Reenviar"); formulários `data-sem-api` (conloq/mash#73) |
| `/dashboard` | `dashboard.ejs` | `GET /user`; indicadores e cards em estado vazio (sem rota na API) |
| `/lots`, `/lots/:id` | `lots.ejs`, `lot.ejs` | `GET /user`; lista e detalhe em estado vazio; excluir é `data-sem-api` (API de lotes na #31/#92) |
| `/lots/new`, `/lots/:id/edit` | `lots.ejs` / `lot.ejs` com `partials/modalLote.ejs` aberto | `GET /user`, `GET /recipes` (seletor de receita); salvar é `data-sem-api` |
| `/lots/:id/monitoring` | `lotMonitoring.ejs` | `GET /user`; histórico, registros e temperatura em estado vazio |
| `/lots/:id/iodine`, `/lots/:id/iodine/reading` | `iodineSession.ejs` (`etapa`) | `GET /user`; câmera desconectada, calibração pendente e capturas vazias (fluxo real na #34) |
| `/analyses/new`, `/analyses/:id` | `iodineDemo.ejs`, `analysis.ejs` | `GET /user` (teste de iodo simulado no frontend em /analyses/new, sem rótulo de simulação; consulta indisponível em /analyses/:id; OpenCV na #34) |

Fora desta entrega: recuperar senha (as telas existem, sem endpoint no depósito, conloq/mash#73), lotes e sessão do iodo (telas em estado vazio), editar temperatura, iodo e preferências de configuração (a API não tem os três últimos; o histórico de logins já é pedido à API, ver `/profile`).

## Repository Directory Map

| Directory | Responsibility Summary | Detailed Map |
|---|---|---|
| `views/` | Templates EJS das telas; `dw2Example.ejs` demonstra renderização de dados no servidor. | [views/codemap.md](views/codemap.md) |
| `controllers/` | Rotas de página, leituras e gravações à API no servidor. | [controllers/codemap.md](controllers/codemap.md) |
| `views/partials/` | Shell compartilhado: header, footer, sidebar, top bar e área de mensagens. | [views/partials/codemap.md](views/partials/codemap.md) |
| `public/` | Recursos estáticos do navegador: CSS, JavaScript, imagens e ícones. | [public/codemap.md](public/codemap.md) |
| `public/css/` | Fonte Tailwind v4 e CSS compilado servido pela aplicação. | [public/css/codemap.md](public/css/codemap.md) |
| `public/js/` | `script.js` (sidebar e modais) e `app.js` (validação e interações de tela). | [public/js/codemap.md](public/js/codemap.md) |
| `scripts/` | Verificações com assert/VM para forms, perfil, upload, foco e EJS (`npm test`). | [scripts/codemap.md](scripts/codemap.md) |
| `docs/` | Documentação de frontend, planos, specs, export do Figma e docs de codebase. | `docs/frontend-screens.md`, `docs/frontend-components.md`, `docs/frontend-figma.md` |

Arquivos na raiz: `index.js`, `package.json`, `.env.example`, `README.md`, `AGENTS.md`, `.coderabbit.yaml`, este `codemap.md`.

## Runtime Flow

1. `npm start` executa `nodemon index.js` na porta 4000. A API (`conloq/Back-End`) precisa estar de pé em `API_URL` para login e páginas com dados.
2. `index.js` configura a sessão e monta `controllers/pageController.js`; o controller carrega dados e chama `res.render(view, locals)`.
3. Login envia POST ao controller, que guarda o JWT na sessão. O navegador recebe cookie `HttpOnly`, nunca o token.
4. Páginas autenticadas validam sessão e consultam `/user`; EJS recebe o usuário e dados específicos da tela.
5. Formulários POST chegam ao controller, que valida entradas, chama a rota correspondente da API com Bearer e redireciona (PRG). O browser não chama a API.
6. Mensagens e valores reaproveitáveis após erro passam pelo flash de sessão. Logout e 401 destroem a sessão local, mas não revogam o JWT na API.
7. O cookie é HttpOnly, SameSite Strict e Secure em produção. A sessão persiste no MySQL em `sessions`; `SESSION_SECRET` forte é obrigatório em produção.
8. `npm run build:css` compila `public/css/tailwind.css` em `public/css/style.css`.

## Cross-Module Integration

- **Back-End:** `controllers/pageController.js` fala com a API do Back-End; o browser não chama diretamente e não depende de CORS. Contrato de autenticação na issue `conloq/mash#38`; rotas em `Back-End/routes/` (`userRoutes.js`, `recipeRoutes.js`, `temperatureRoutes.js`).
- **Nomes de campo:** o perfil recebe `phone` e `urlImage` em camelCase e envia `phone` no formulário (conloq/mash#71). Receitas e rampas usam `/recipes` e campos camelCase, incluindo `minTemperatureRamp`, `idealTime` e `orderRamp`, pela #86.
- **Shell:** `header.ejs` + `footer.ejs` envolvem todas as páginas; o `topBar.ejs` e `profile.ejs` recebem `user` como local EJS; `partials/mensagens.ejs` é a área `#mensagens`.
- **JavaScript ↔ templates:** `public/js/script.js` depende de IDs, classes e `data-*` das views (`#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link`, `#senha`, `#btnAlterar`, `#btnSalvar`, `#inputFoto`, `#previewFoto`, `#formPerfil`, `.js-modal`, `[data-modal-open]`, `[data-modal-close]`). `public/js/app.js` cuida de validação e interações de interface (`#formPerfil`, `#formFoto`, `#formReceita`, `#listaReceitas`, `#formTemperatura`, `#mensagens`).
- **Tailwind:** `public/css/tailwind.css` coleta classes de `views/` e `public/js/` via `@source` e define o tema do redesign v2 (tokens `--color-*` como `--color-acao`, `--color-fundo` e `--color-mash-brown`) e as classes de componente (`btn-*`, `campo*`, `card`, `selo-*`, `tabela-*`, `esqueleto`); detalhes em `public/css/codemap.md`.
- **Coordenação:** `haimonvieira/conloq-pi-coordenacao` (local `D:/Fatec/PI/team-lead`) guarda o estado do projeto.

## Scope Exclusions

Este atlas documenta o código verificável deste repositório. Ficam fora: `node_modules/`, `public/css/style.css` (saída gerada), `.git/` e `docs/**` como fonte de arquitetura.

O Back-End **não faz parte deste repositório**: `controllers/pageController.js` contém rotas de apresentação, não regras de negócio nem controllers da API. Banco e emissão de JWT vivem em `conloq/Back-End`.

## Receitas e rampas: integração da #86

O controller consome `GET/POST /recipes`, `GET /recipes/:id` e `GET/POST /recipes/:id/temperatures` da #32. Lista, detalhe e rampas são passados aos templates EJS. A tela usa `minTemperatureRamp`, `maxTemperatureRamp`, `minTemperatureLimit`, `maxTemperatureLimit`, `timer`, `initialization`, `idealTime` e `orderRamp` opcional. Temperaturas inteiras entre 0 e 100 °C, mínimo ≤ máximo; horários HH:MM:SS.

Rotas de tela: `/recipes` (`recipes.ejs`), `/recipes/:id` e `/recipes/:id/edit` (`recipe.ejs`) e `/recipes/:id/temperatures/new` e `/recipes/:id/temperatures/:temperatureId/edit` (`temperatureForm.ejs`). Lotes e análises mostram estados de indisponibilidade até a integração com a API. O teste de iodo em `/analyses/new` é uma simulação com dados locais, sem persistência e sem etiqueta de simulação na tela (decisão de 21/10/2026, conloq/mash#9). Edição e exclusão de rampas permanecem na #97. O visual segue o redesign v2 de `docs/design/mash.pen`.

O controller realiza leituras e mutações com Bearer no servidor; o navegador não recebe o token. PUT/DELETE existentes foram alinhados ao caminho em inglês para preservar a interface; a conclusão das regras da #93, incluindo vínculo com lotes, continua naquela issue. Perfil mantém phone/urlImage da #71. O design atual é mantido pela regra da #78, sem bloqueio por desenho ausente. Validação pública ainda depende do deploy #68/#69; evidência local não equivale a deploy.
