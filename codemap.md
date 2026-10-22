# Repository Atlas: frontend (Sistema MASH)

## Project Responsibility

Frontend do Sistema MASH (Projeto Integrador III, DSM3, FATEC Registro, org `conloq`): templates EJS, Tailwind CSS v4 e JavaScript vanilla do navegador, entregues por um `index.js` na porta 4000.

Dois repositórios, um papel cada: este só tem telas; o Back-End (`conloq/Back-End`, API REST na porta 8080) tem regra de negócio, banco e JWT. O `index.js` **só entrega as páginas** (`res.render`) e não repete nenhuma rota da API. Quem consome a API é o navegador, em `public/js/app.js`, com `fetch` direto nas rotas do próprio Back-End (`/login`, `/user`, `/recipes`...). O Back-End libera CORS para `http://localhost:4000`. O token JWT fica no `localStorage` (`mash-token`) e vai como Bearer.

## System Entry Points

- `index.js`: aplicação Express: view engine EJS, `public/` e `/vendor/phosphor` estáticos e uma rota `GET` por tela. Escuta em `PORT` (padrão 4000). Lê `API_URL` (padrão `http://localhost:8080`), expõe em `app.locals.apiUrl` e carrega `.env` com `process.loadEnvFile()`.
- `public/js/app.js`: consumo da API: guarda de rota, login, cadastro, perfil, foto, receitas, temperatura e mensagens. Lê `window.API_URL`, definido em `views/partials/footer.ejs`.
- `package.json`: runtime ESM; scripts `start` (`nodemon index.js`), `build:css`, `watch:css` e `test` (sintaxe do servidor e verificações de perfil, upload e regressões do cliente).
- `.env.example`: `PORT=4000` e `API_URL=http://localhost:8080`.
- `public/css/tailwind.css`: entrada do Tailwind v4 e fonte das classes usadas nos templates e no JS.
- `views/partials/header.ejs`: `<head>` compartilhado que carrega `/vendor/phosphor/src/regular/style.css` e `/css/style.css`.

### Telas (`index.js`)

| Rota GET | Template | Chamadas da API feitas por `app.js` |
|---|---|---|
| `/` | - | redireciona para `/recipes` |
| `/login` | `login.ejs` | `POST /login` |
| `/cadastro` | `cadastro.ejs` | `POST /user` |
| `/logout` | - | redireciona para `/login`; o `app.js` apaga o token |
| `/usuario` | `usuario.ejs` | `GET /user`, `PUT /user`, `PUT /user/upload`, `DELETE /user` e `GET /user/login-history` no card "Últimos acessos" (rota prevista na conloq/mash#102; enquanto a API responde 404, o card mostra "Histórico indisponível") |
| `/configuracao`, `/configuracao/seguranca` | `configuracao.ejs` (`aba`) | nenhuma; salvar usa `data-sem-api` |
| `/recipes` | `recipes.ejs` | `GET /user`, `GET /recipes`, `GET /recipes/:id/temperatures` (uma por receita), `POST /recipes`, `DELETE /recipes/:id` |
| `/recipes/:id`, `/recipes/:id/edit` | `recipe.ejs` | `GET /recipes/:id`, `GET /recipes/:id/temperatures`, `PUT /recipes/:id`, `DELETE /recipes/:id` (`/edit` é a mesma tela; cada rampa oferece ações para editar e excluir, ambas com aviso `data-sem-api`, #97) |
| `/recipes/:id/temperatures/new` | `temperatureForm.ejs` | `GET /user`, `GET /recipes/:id`, `POST /recipes/:id/temperatures` |
| `/recipes/:id/temperatures/:temperatureId/edit` | `temperatureForm.ejs` (`editando`) | `GET /user`, `GET /recipes/:id`, `GET /recipes/:id/temperatures`; salvar é `data-sem-api` (#97) |
| `/lots`, `/lots/:id` | `lots.ejs`, `lot.ejs` | `GET /user` (consulta indisponível; API de lotes na #31/#92) |
| `/analyses/new`, `/analyses/:id` | `iodineDemo.ejs`, `analysis.ejs` | `GET /user` (teste de iodo simulado no frontend em /analyses/new, sem rótulo de simulação; consulta indisponível em /analyses/:id; OpenCV na #34) |

Fora desta entrega: `/recuperar-senha` (sem endpoint no depósito; o link sai ou mostra aviso, conloq/mash#73), editar temperatura, iodo e preferências de configuração (a API não tem os três últimos; o histórico de logins já é pedido à API, ver `/usuario`).

## Repository Directory Map

| Directory | Responsibility Summary | Detailed Map |
|---|---|---|
| `views/` | Templates EJS das telas. O HTML sai sem dados; o `app.js` preenche. | [views/codemap.md](views/codemap.md) |
| `views/partials/` | Shell compartilhado: header, footer, sidebar, top bar e área de mensagens. | [views/partials/codemap.md](views/partials/codemap.md) |
| `public/` | Recursos estáticos do navegador: CSS, JavaScript, imagens e ícones. | [public/codemap.md](public/codemap.md) |
| `public/css/` | Fonte Tailwind v4 e CSS compilado servido pela aplicação. | [public/css/codemap.md](public/css/codemap.md) |
| `public/js/` | `script.js` (sidebar, modais, formulários) e `app.js` (consumo da API). | [public/js/codemap.md](public/js/codemap.md) |
| `scripts/` | Verificações com assert/VM para perfil, upload, sessão, timeout, foco e EJS (`npm test`). | [scripts/codemap.md](scripts/codemap.md) |
| `docs/` | Documentação de frontend, planos, specs, export do Figma e docs de codebase. | `docs/frontend-screens.md`, `docs/frontend-components.md`, `docs/frontend-figma.md` |

Arquivos na raiz: `index.js`, `package.json`, `.env.example`, `README.md`, `AGENTS.md`, `.coderabbit.yaml`, este `codemap.md`.

## Runtime Flow

1. `npm start` executa `nodemon index.js` na porta 4000. A API (`conloq/Back-End`) precisa estar de pé em `API_URL`.
2. Toda página carrega `window.API_URL` (footer), `/js/script.js` e `/js/app.js`.
3. Guarda de rota: sem `mash-token`, qualquer tela que não seja `/login` ou `/cadastro` volta para `/login`; com token, `/login` e `/cadastro` vão para `/recipes`.
4. Login: `#formLogin` faz `POST {API_URL}/login`; com 200 grava `data.token` no `localStorage` e vai para `/recipes`.
5. Chamadas protegidas: `api()` envia `Authorization: Bearer <token>`. Um 401 só apaga o token usado naquela chamada, se ainda for o atual, e volta ao `/login` com aviso.
6. Mensagens: a mensagem da API (`error` ou `message`, em pt-BR) aparece como veio em `#mensagens`, em Tailwind: `danger`, `warning` e `success`. Após um redirecionamento, a mensagem passa por `localStorage` (`mash-flash`). Com a API fora do ar, `api()` devolve 503 com "Não foi possível falar com a API". Chamadas têm timeout de 15 s; em gravações, o aviso pede conferir os dados antes de repetir.
7. Logout e exclusão de conta apagam o token. A API não revoga tokens; eles expiram em um dia.
8. Todo template inclui `partials/header.ejs` e `partials/footer.ejs`; as telas autenticadas incluem também `partials/sidebar.ejs` e `partials/topBar.ejs`, que o `app.js` preenche com `data-user`.
9. `npm run build:css` compila `public/css/tailwind.css` em `public/css/style.css`.

## Cross-Module Integration

- **Back-End:** só `public/js/app.js` fala com a API, nas rotas do próprio Back-End. O `app.js` do Back-End libera CORS para `FRONTEND_URL` (padrão `http://localhost:4000`). Contrato de autenticação na issue `conloq/mash#38`; rotas em `Back-End/routes/` (`userRoutes.js`, `recipeRoutes.js`, `temperatureRoutes.js`).
- **Nomes de campo:** o perfil recebe `phone` e `urlImage` em camelCase e envia `phone` no formulário (conloq/mash#71). Receitas e rampas usam `/recipes` e campos camelCase, incluindo `minTemperatureRamp`, `idealTime` e `orderRamp`, pela #86.
- **Shell:** `header.ejs` + `footer.ejs` envolvem todas as páginas; `topBar.ejs` e `usuario.ejs` são preenchidos pelo `app.js` via `data-user`; `partials/mensagens.ejs` é a área `#mensagens`.
- **JavaScript ↔ templates:** `public/js/script.js` depende de IDs, classes e `data-*` das views (`#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link`, `#senha`, `#btnAlterar`, `#btnSalvar`, `#inputFoto`, `#previewFoto`, `#formPerfil`, `.js-modal`, `[data-modal-open]`, `[data-modal-close]`). `public/js/app.js` depende de `#formLogin`, `#formCadastro`, `#formPerfil`, `#formFoto`, `#btnExcluir`, `#formReceita`, `#listaReceitas`, `#formTemperatura`, `#mensagens` e `[data-user]`.
- **Tailwind:** `public/css/tailwind.css` coleta classes de `views/` e `public/js/` via `@source` e define o tema do redesign v2 (tokens `--color-*` como `--color-acao`, `--color-fundo` e `--color-mash-brown`) e as classes de componente (`btn-*`, `campo*`, `card`, `selo-*`, `tabela-*`, `esqueleto`); detalhes em `public/css/codemap.md`.
- **Coordenação:** `haimonvieira/conloq-pi-coordenacao` (local `D:/Fatec/PI/team-lead`) guarda o estado do projeto.

## Scope Exclusions

Este atlas documenta o código verificável deste repositório. Ficam fora: `node_modules/`, `public/css/style.css` (saída gerada), `.git/` e `docs/**` como fonte de arquitetura.

O Back-End **não faz parte deste repositório**: aqui não existem `config/`, `routes/` de API, `controllers/`, `middlewares/`, `models/` nem `services/`, nem MySQL, Sequelize, bcrypt, JWT ou sessão de servidor. Regra de negócio e banco vivem em `conloq/Back-End`.

## Receitas e rampas: integração da #86

O navegador consome `GET/POST /recipes`, `GET /recipes/:id` e `GET/POST /recipes/:id/temperatures` da #32. Lista em `recipes`, detalhe em `recipe` e rampas em `temperatures`. A tela usa `minTemperatureRamp`, `maxTemperatureRamp`, `minTemperatureLimit`, `maxTemperatureLimit`, `timer`, `initialization`, `idealTime` e `orderRamp` opcional. Temperaturas inteiras entre 0 e 100 °C, mínimo ≤ máximo; horários HH:MM:SS.

Rotas de tela: `/recipes` (`recipes.ejs`), `/recipes/:id` e `/recipes/:id/edit` (`recipe.ejs`) e `/recipes/:id/temperatures/new` e `/recipes/:id/temperatures/:temperatureId/edit` (`temperatureForm.ejs`). Lotes e análises mostram estados de indisponibilidade até a integração com a API. O teste de iodo em `/analyses/new` é uma simulação com dados locais, sem persistência e sem etiqueta de simulação na tela (decisão de 21/10/2026, conloq/mash#9). Edição e exclusão de rampas permanecem na #97. O visual segue o redesign v2 de `docs/design/mash.pen`.

Detalhe, criação, edição do nome e exclusão de receita usam chamadas reais com Bearer. PUT/DELETE existentes foram alinhados ao caminho em inglês para preservar a interface; a conclusão das regras da #93, incluindo vínculo com lotes, continua naquela issue. Perfil mantém phone/urlImage da #71. O design atual é mantido pela regra da #78, sem bloqueio por desenho ausente. Validação pública ainda depende do deploy #68/#69; evidência local não equivale a deploy.
