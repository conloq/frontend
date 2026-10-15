# Codebase Concerns

## 1) Top Risks (Prioritized)

| Severity | Concern | Evidence | Impact | Suggested action |
|----------|---------|----------|--------|------------------|
| high | Formulários de login e cadastro não têm `action` nem `method`; dependem inteiramente de `app.js` | `views/login.ejs:30`, `views/cadastro.ejs:6` | Se o JS falhar, for bloqueado ou não inicializar, o submit nativo vira `GET` para a própria URL e coloca e-mail e senha na query string (histórico, logs de acesso) | Definir `method="post"` e um destino que não exponha credenciais, ou desabilitar o botão até o cliente estar pronto |
| high | Token JWT em `localStorage` em vez do cookie `HttpOnly` descrito na `conloq/mash#6` | `public/js/app.js` (`TOKEN_KEY`), issue #6 | Qualquer XSS no domínio lê o token e assume a sessão (perfil, exclusão de conta, receitas) | Decisão do time: adotar cookie `HttpOnly` no servidor EJS, ou aceitar e documentar o risco |
| high | O frontend depende de CORS que ainda não está em `main` no Back-End | `conloq/Back-End` branch `feat/cors-frontend` (`8b8518a`) | Mergeado o PR #4 sem o CORS, todas as chamadas falham no navegador | Mergear o PR de CORS antes ou junto; definir `FRONTEND_URL` no `.env` do Back-End (hoje ausente) |
| medium | Iodo e edição de temperatura não têm rota na API, mas as telas têm formulários e botões que não fazem nada | `views/adicionarIodo.ejs`, `views/editarIodo.ejs`, `views/editarTemperatura.ejs` | Botão que não funciona — exatamente a crítica da banca que originou a `conloq/mash#73` | Estado "indisponível" explícito nas telas (escopo da #73) |
| medium | `#listaReceitas` busca a temperatura de cada receita em paralelo, uma requisição por receita | `public/js/app.js` (`carregarReceitas`) | N+1: com muitas receitas, N requisições ao abrir a tela; a API não tem rota que traga as temperaturas junto | Aceitável no volume atual; revisar se a API ganhar `include` das temperaturas |
| medium | Sem `AbortController`/timeout no `fetch` | `public/js/app.js` (`api`) | API pendurada deixa a tela sem dados e sem mensagem, indefinidamente | Adicionar timeout com `AbortSignal.timeout(...)` |
| low | `.omp/state/continuity.md` é artefato de agente, não versionado hoje | `git status` | Ruído no PR se for adicionado por engano | Manter fora do versionamento |
| low | `public/css/style.css` é artefato gerado e está versionado | `git ls-files`, `public/css/style.css` | Drift entre fonte Tailwind e CSS servido; conflito de merge em arquivo grande | Regenerar e commitar junto de toda mudança de classe |

## 2) Technical Debt

| Debt item | Why it exists | Where | Risk if ignored | Suggested fix |
|-----------|---------------|-------|-----------------|---------------|
| Estado de sessão sem geração/versão | Um único slot mutável de token, compartilhado entre abas | `public/js/app.js` | Um `401` atrasado apaga um token novo; um login atrasado repõe estado após logout em outra aba | Comparar a identidade do token antes de apagar, ou versionar a sessão |
| Logout só limpa o cliente | A API não revoga token | `public/js/app.js` (`sair`), `index.js` (`/logout`) | O token continua válido até expirar (1 dia) se for copiado antes do logout | Documentar; considerar endpoint de revogação no Back-End |
| Nenhum teste | Sem runner no projeto | repositório inteiro | Regressão de renderização ou de contrato HTML↔JS só aparece em uso manual | Smoke de compilação EJS + status das 10 rotas |
| Contrato HTML↔JS por string de seletor | Um script para todas as telas | `public/js/app.js` ↔ `views/**/*.ejs` | Renomear um `id` quebra o comportamento sem erro (`?.` engole a falha) | Comentar o contrato no topo do script ou testar presença de seletores |
| `escapar()` depende de `textContent` + `innerHTML` + `replace` de aspas | Aproveitou o escape nativo do DOM e cobriu atributos por cima | `public/js/app.js` | Funciona, mas é sutil: trocar por `createElement`/`textContent` puro reabre o XSS de atributo | Se tocar na função, construir os nós por propriedades em vez de interpolar HTML |
| Cache-busting manual | Forçar recarga do shell | `views/partials/footer.ejs` (`?v=4`) | Esquecer de incrementar faz o navegador servir JS antigo | Incrementar a cada mudança em `script.js` |
| `views/index.ejs` órfão | Sobra de teste (`<h1>Teste</h1>`) | `views/index.ejs` | Confunde quem procura a home (a home é `login.ejs`) | Remover |
| 20 PNGs em `public/icons/` sem referência | Ícones anteriores à adoção do Phosphor | `public/icons/` | Peso morto no repositório | Remover ou documentar quem usa |

## 3) Security Concerns

| Risk | OWASP category (if applicable) | Evidence | Current mitigation | Gap |
|------|--------------------------------|----------|--------------------|-----|
| Token legível por JavaScript | A07 Identification and Authentication Failures | `public/js/app.js` (`localStorage`) | Nenhuma | Risco aceito em 12/10/2026, quando o time trocou o cookie `HttpOnly` pelo `localStorage` (#6) |
| Injeção de atributo na lista de receitas | A03 Injection | `public/js/app.js` (`escapar`, `data-excluir`, `href`) | `escapar()` neutraliza `<`, `>`, `&`, `"` e `'` (corrigido no PR #4) | Nenhum gap conhecido após a correção; evitar regressão |
| Credenciais na URL se o JS falhar | A04 Insecure Design | `views/login.ejs:30`, `views/cadastro.ejs:6` | Nenhuma | Formulários sem `method`/`action` |
| Sem CSP nem cabeçalhos de segurança | A05 Security Misconfiguration | `index.js`, `views/partials/header.ejs` | Nenhuma | Revisar antes de qualquer deploy |
| `FRONTEND_URL` ausente no `.env` do Back-End | A05 Security Misconfiguration | `conloq/Back-End/.env` | Código tem default `http://localhost:4000` | Em deploy, definir a origem real (senão o CORS bloqueia ou fica amplo demais) |
| Chave de API já removida do histórico recente | A02 Cryptographic Failures | commit `cf2dc27` | Removida do `opencode.json` | Verificar se a chave exposta foi rotacionada |

## 4) Performance and Scaling Concerns

| Concern | Evidence | Current symptom | Scaling risk | Suggested improvement |
|---------|----------|-----------------|-------------|-----------------------|
| N+1 de temperaturas por receita | `public/js/app.js` (`carregarReceitas`) | Nenhum no volume atual | Abrir `/receitas` com muitas receitas dispara N chamadas | Rota na API que devolva as temperaturas junto |
| `public/img/mash.png` (190,7 KB) sem otimização | scan, "Top 10 largest files" | Nenhum em local | Peso de página em conexão lenta | Comprimir/redimensionar antes de publicar |
| Compilação Tailwind manual | `package.json` (`build:css`) | Build esquecido faz classes novas não existirem | Telas quebradas silenciosamente | Rodar `watch:css` durante o desenvolvimento |
| Sem timeout em `fetch` | `public/js/app.js` (`api`) | Tela vazia se a API pendurar | Piora com latência em deploy | `AbortSignal.timeout(...)` |

## 5) Fragile/High-Churn Areas

| Area | Why fragile | Churn signal | Safe change strategy |
|------|-------------|-------------|----------------------|
| `public/js/app.js` (328 linhas) | Concentra todo o cliente: token, guarda, 9 fluxos e render de HTML por string | Arquivo novo, já revisado 2x no PR #4 | Testar cada tela afetada; não remover os `?.` |
| `views/usuario.ejs` | Maior template: perfil, edição, modal de foto e prévia | Maior template do scan | Alterar em blocos e reabrir `/usuario` |
| `views/receita.ejs` | Lista montada por HTML em string no cliente, com grid de colunas fixas | Já editado em commits recentes | Preservar `grid-cols-[...]` e `min-w-[680px]` |
| `public/css/tailwind.css` | Contém o shell inteiro em `@layer components`, com media query de 1024px | Fonte do CSS servido | Rebuild obrigatório; conferir sidebar expandida/recolhida |
| `docs/` | Prosa histórica que descrevia o monólito antigo | `docs/superpowers/**` e `docs/frontend-*.md` | Tratar como histórico, não como estado atual |

## 6) Perguntas ao time (todas respondidas em 15/10/2026)

1. Resolvido em 12/10/2026 (decisão do Haimon, registrada na conloq/mash#66 e na #6): o token fica em `localStorage`; o risco de XSS foi aceito.
2. Decidido em 15/10/2026: sim, entra na conloq/mash#73. Pergunta original: os formulários de login e cadastro devem ganhar `method="post"` para não vazar credenciais na URL se o JS falhar?
3. Resolvido: o CORS entrou na `main` do Back-End em 13/10/2026 (conloq/Back-End#8); `FRONTEND_URL` é definida no deploy da API (conloq/mash#68).
4. Decidido em 15/10/2026: sim, a remoção dos PNGs órfãos de `public/icons/` e do `views/index.ejs` entra na conloq/mash#73.
5. Decidido em 15/10/2026: ainda não; fica na conloq/mash#94, como Could, para depois do depósito. Pergunta original: deve existir algum pipeline (GitHub Actions) rodando `npm test` + `build:css` em PR, ou a revisão continua apenas com o CodeRabbit?

## 7) Evidence

- `docs/codebase/.codebase-scan.txt` (CODE METRICS, HIGH-CHURN FILES, CI/CD)
- `public/js/app.js`
- `views/login.ejs`, `views/cadastro.ejs`
- `views/adicionarIodo.ejs`, `views/editarIodo.ejs`, `views/editarTemperatura.ejs`
- `views/partials/footer.ejs`
- `index.js`, `.env.example`, `.gitignore`
- `conloq/mash#6`, `conloq/mash#73`
