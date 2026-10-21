# Architecture

## 1) Architectural Style

- Primary style: servidor de páginas + cliente SPA-lite (navegação por documento, dados por `fetch`).
- Why this classification: `index.js` só renderiza telas e serve estáticos: nenhuma rota sua chama a API; todo o estado de dados (token, listas, mensagens) vive em `public/js/app.js`, que fala direto com o Back-End.
- Primary constraints: (a) o Back-End precisa liberar CORS para a origem do frontend; (b) o token fica em `localStorage`, portanto legível por JavaScript; (c) o `index.js` não tem sessão, cookie ou estado: cada tela é um documento novo.

## 2) System Flow

```text
Navegador → GET /recipes
  → index.js: res.render("recipes")            (sem dados)
  → views/partials/header.ejs                  (Phosphor + /css/style.css)
  → HTML com contêineres vazios (#listaReceitas, #mensagens, [data-user])
  → views/partials/footer.ejs                  (window.API_URL, script.js, app.js)
  → app.js: guarda de rota (tem token?)
  → app.js: fetch {API_URL}/recipes + /user com Bearer
  → app.js: preenche #listaReceitas e [data-user]; erro → #mensagens
```

1. `npm start` executa `index.js`, que resolve `views/` e `public/` a partir de `import.meta.url`.
2. `express.static` publica `public/` e `/vendor/phosphor`.
3. Cada rota GET chama `res.render(view, { receitaId: req.params.id })`: o único dado passado é o `:id` da URL.
4. `footer.ejs` injeta `window.API_URL` e carrega `script.js` (shell) e `app.js` (dados), nessa ordem.
5. `app.js` roda a guarda de rota e então dispara as chamadas conforme a tela.
6. Erros e mensagens da API aparecem em `#mensagens`; `401` com token presente descarta o token e volta para `/login`.

## 3) Layer/Module Responsibilities

| Layer or module | Owns | Must not own | Evidence |
|-----------------|------|--------------|----------|
| `index.js` | Bootstrap do Express, estáticos, rotas GET, `window.API_URL` | Dados, autenticação, chamadas à API | `index.js` |
| `views/*.ejs` | Marcação, classes Tailwind, contêineres e âncoras para o cliente | Dados, `fetch`, decisões de acesso | `views/receita.ejs`, `views/usuario.ejs` |
| `views/partials/footer.ejs` | `window.API_URL`, ordem de carregamento dos scripts | Lógica de tela | `views/partials/footer.ejs` |
| `public/js/app.js` | Chamadas à API, token, guarda de rota, mensagens, render de listas | Regra de negócio, autorização real | `public/js/app.js` |
| `public/js/script.js` | Shell: sidebar, drawer, modais, senha, prévia de foto | Chamadas à API | `public/js/script.js` |
| `public/css/tailwind.css` | Tema, `@source` e estilos do shell em `@layer components` | CSS de página isolada | `public/css/tailwind.css` |

## 4) Reused Patterns

| Pattern | Where found | Why it exists |
|---------|-------------|---------------|
| `api()` que nunca lança, devolvendo `{ status, data }` | `public/js/app.js` | Um só ponto para Bearer, JSON, 401 e falha de rede (503) |
| Guarda de rota no load | `public/js/app.js` | Redireciona quem não tem token e quem já está logado |
| Mensagens lidas como `data.error ?? data.message` | `public/js/app.js` | A API responde `message` no 400 do login e `error` nos demais |
| Flash por `localStorage` | `public/js/app.js` (`mash-flash`) | Mensagem sobrevive a um redirecionamento |
| Preenchimento por atributo (`data-user`) | `views/partials/topBar.ejs`, `views/usuario.ejs` | Um seletor preenche vários lugares |
| Partial composition | `views/*.ejs` | Não duplicar `<head>` e carregamento de assets |
| Shell em `@layer components` | `public/css/tailwind.css` | Estado expandido/recolhido da sidebar sem utilitários repetidos |

## 5) Known Architectural Risks

- Token em `localStorage`: qualquer XSS no domínio lê o JWT e assume a sessão. Risco aceito pelo time em 12/10/2026, quando o cookie `HttpOnly` foi trocado pelo `localStorage` (`conloq/mash#6`).
- Formulários sem `action`/`method`: `#formLogin` e `#formCadastro` dependem do JS. Sem `app.js`, o submit nativo vira `GET` para a própria URL e coloca e-mail e senha na query string. Impacto alto, mitigação inexistente.
- Dependência de CORS não versionada aqui: o Back-End libera `FRONTEND_URL` desde 13/10/2026 (conloq/Back-End#8); no deploy, a variável precisa ter a URL publicada deste frontend (conloq/mash#68), senão o navegador bloqueia as chamadas.
- Sem sessão de servidor: a guarda de rota é apenas cosmética; a autorização real é da API. Impacto baixo (aceitável), desde que não se confie nela.
- Contrato HTML↔JS por seletor, sem teste: renomear um `id` quebra silenciosamente. Impacto médio.

## 6) Evidence

- `index.js`
- `public/js/app.js`
- `views/partials/footer.ejs`
- `views/partials/topBar.ejs`
- `public/css/tailwind.css`
- `docs/codebase/.codebase-scan.txt`
