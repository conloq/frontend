# External Integrations

## 1) Integration Inventory

| System | Type (API/DB/Queue/etc) | Purpose | Auth model | Criticality | Evidence |
|--------|---------------------------|---------|------------|-------------|----------|
| Back-End MASH (`conloq/Back-End`, porta 8080) | REST API | Login, cadastro, perfil, foto, receitas e temperatura | JWT em `Authorization: Bearer`, guardado em `localStorage` (`mash-token`) | Alta: sem ela nenhuma tela mostra dados | `public/js/app.js`, `index.js` |
| `@phosphor-icons/web` (pacote local) | Assets estáticos | Ícones servidos em `/vendor/phosphor` | Nenhuma | Média | `index.js`, `views/partials/header.ejs` |
| `localStorage` (navegador) | Armazenamento local | Token (`mash-token`) e mensagem de flash (`mash-flash`) | Nenhuma (legível por JavaScript) | Alta | `public/js/app.js` |

## 2) Data Stores

| Store | Role | Access layer | Key risk | Evidence |
|-------|------|--------------|----------|----------|
| `localStorage` | Guarda o JWT entre páginas e a mensagem que sobrevive a redirecionamento | `public/js/app.js` | Qualquer XSS lê o token e assume a sessão; `localStorage` é por origem, não por aba | `public/js/app.js` (`TOKEN_KEY`, `FLASH_KEY`) |
| Banco MySQL (Back-End) | Persistência real | Não acessada daqui | Nenhum acesso direto deste repositório | `conloq/Back-End` |

## 3) Secrets and Credentials Handling

- Credential sources: nenhuma credencial neste repositório. As únicas variáveis são `API_URL` e `PORT` (`.env.example`).
- Hardcoding checks: nenhum segredo, chave ou token no código. O histórico registra uma chave removida em `cf2dc27` (`chore(security): remover chave de API versionada do opencode.json`).
- Rotation or lifecycle notes: o JWT expira em 1 dia na API (a API não revoga tokens). O logout apenas apaga o token local: não há chamada de revogação. `.gitignore` cobre `.env` e `.env.*` com exceção `!.env.example`.

## 4) Reliability and Failure Behavior

- Retry/backoff behavior: NONE; nenhuma tentativa repetida.
- Timeout policy: NONE; `fetch` sem `AbortController`; uma API pendurada deixa a tela sem dados e sem mensagem.
- Circuit-breaker or fallback behavior: parcial. Falha de rede vira `{ status: 503 }` com "Não foi possível falar com a API" em `#mensagens`. Não há fallback de dados nem cache offline.
- CORS: obrigatório. O Back-End responde `Access-Control-Allow-Origin` a partir de `FRONTEND_URL` (padrão `http://localhost:4000`). No deploy, configurar `FRONTEND_URL` com a origem pública do frontend; o padrão localhost não atende a origem publicada.

## 5) Observability for Integrations

- Logging around external calls: NONE no cliente: erros aparecem só na interface.
- Metrics/tracing coverage: NONE.
- Missing visibility gaps: nenhum log de requisição ou de erro de API; nenhum log de acesso no servidor; a única saída do `index.js` é a linha de sucesso do `listen` e a de falha de bind.

## 6) Endpoint Catalog (consumido pelo navegador)

| Método | Rota | Corpo / resposta usados |
|---|---|---|
| POST | `/login` | `{ email, password }` → 200 `{ token, user }`; 400 em `error`; 401 em `error` |
| POST | `/user` | `{ name, email, password }` → 201 |
| GET | `/user` | → 200 `{ user }` (`id`, `name`, `email`, `phone`, `urlImage`, `createdAt`) |
| PUT | `/user` | `{ name, email, phone, password? }` → 200 |
| PUT | `/user/upload` | `FormData` com `image` → 200 `{ url }` |
| DELETE | `/user` | → 204 |
| GET | `/recipes` | → 200 `{ recipes: [...] }` |
| POST | `/recipes` | `{ name }` → 201 |
| GET | `/recipes/:id` | → 200 `{ recipe }` |
| PUT | `/recipes/:id` | `{ name }` → 200; operação existente, regras de lotes permanecem na #93 |
| DELETE | `/recipes/:id` | → 204 |
| GET | `/recipes/:id/temperatures` | → 200 `{ temperatures: [...] }` |
| POST | `/recipes/:id/temperatures` | rampas, limites, `timer`, `initialization`, `idealTime` → 201 |

Sem integração nesta entrega: telas de iodo e edição de temperatura (#97).


## 7) Evidence

- `index.js`
- `public/js/app.js`
- `views/partials/footer.ejs`
- `.env.example`, `.gitignore`
- `conloq/Back-End` (`app.js` com CORS, `routes/*.js`)
- `docs/codebase/.codebase-scan.txt`

## Receitas e rampas: integração da #86

O navegador consome `GET/POST /recipes`, `GET /recipes/:id` e `GET/POST /recipes/:id/temperatures` da #32. Lista em `recipes`, detalhe em `recipe` e rampas em `temperatures`. A tela usa `minTemperatureRamp`, `maxTemperatureRamp`, `minTemperatureLimit`, `maxTemperatureLimit`, `timer`, `initialization`, `idealTime` e `orderRamp` opcional. Temperaturas inteiras entre 0 e 100 °C, mínimo ≤ máximo; horários HH:MM:SS.

Rotas de tela: `/recipes` (`recipes.ejs`), `/recipes/:id` e `/recipes/:id/edit` (`recipe.ejs`) e `/recipes/:id/temperatures/new` e `/recipes/:id/temperatures/:temperatureId/edit` (`temperatureForm.ejs`). Lotes e análises mostram estados de indisponibilidade até a integração com a API. O teste de iodo em `/analyses/new` mantém uma demonstração identificada com dados simulados, sem persistência. Edição e exclusão de rampas permanecem na #97. O visual segue o redesign v2 de `docs/design/mash.pen`.

Detalhe, criação, edição do nome e exclusão de receita usam chamadas reais com Bearer. PUT/DELETE existentes foram alinhados ao caminho em inglês para preservar a interface; a conclusão das regras da #93, incluindo vínculo com lotes, continua naquela issue. Perfil mantém phone/urlImage da #71. O design atual é mantido pela regra da #78, sem bloqueio por desenho ausente. Validação pública ainda depende do deploy #68/#69; evidência local não equivale a deploy.
