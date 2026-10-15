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
- CORS: obrigatório. O Back-End responde `Access-Control-Allow-Origin` a partir de `FRONTEND_URL` (padrão `http://localhost:4000`). `FRONTEND_URL` não está definida no `.env` do Back-End; em deploy a origem cai no default e o navegador bloqueia a chamada.

## 5) Observability for Integrations

- Logging around external calls: NONE no cliente: erros aparecem só na interface.
- Metrics/tracing coverage: NONE.
- Missing visibility gaps: nenhum log de requisição ou de erro de API; nenhum log de acesso no servidor; a única saída do `index.js` é a linha de sucesso do `listen` e a de falha de bind.

## 6) Endpoint Catalog (consumido pelo navegador)

| Método | Rota | Corpo / resposta usados |
|---|---|---|
| POST | `/login` | `{ email, password }` → 200 `{ token, user }`; 400 em `message`; 401 em `error` |
| POST | `/user` | `{ name, email, password }` → 201 |
| GET | `/user` | → 200 `{ user }` (`id`, `name`, `email`, `fone`, `url_image`, `createdAt`) |
| PUT | `/user` | `{ name, email, fone, password? }` → 200 |
| PUT | `/user/upload` | `FormData` com `imageUser` → 200 `{ url }` |
| DELETE | `/user` | → 204 |
| GET | `/receitas` | → 200 `{ recipe: [...] }` |
| POST | `/receitas` | `{ name }` → 201 |
| DELETE | `/receitas/:recipeId` | → 204 |
| GET | `/receitas/temperatura/:id` | → 200 `{ temperatures: [...] }` |
| POST | `/receitas/temperatura/:id` | rampas, limites, `timer`, `initialization`, `ideal_time` → 201 |

Sem rota na API (telas só de layout): iodo (`/receitas/iodo/...`) e edição de temperatura.

> **Mudança prevista:** com a conloq/mash#71 e a conloq/mash#32, a API passa a usar `/recipes` e `/recipes/:id/temperatures`, e os campos passam a camelCase (`minTemperatureRamp`, `idealTime`, `phone`, `urlImage`; decisão de 08/10/2026). A troca no `public/js/app.js` e nos formulários é a conloq/mash#86, que atualiza esta tabela no mesmo Pull Request. Alterar e excluir receita via API são a conloq/mash#93.

## 7) Evidence

- `index.js`
- `public/js/app.js`
- `views/partials/footer.ejs`
- `.env.example`, `.gitignore`
- `conloq/Back-End` (`app.js` com CORS, `routes/*.js`)
- `docs/codebase/.codebase-scan.txt`
