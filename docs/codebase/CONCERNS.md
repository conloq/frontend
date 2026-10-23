# Codebase Concerns

## Correções verificadas em 21/10/2026

Formulários com senha usam `method="post"`; um 401 atrasado não remove outro token; chamadas têm timeout de 15 segundos, com aviso de resultado incerto nas gravações. Modais e confirmação compartilham controle de foco e fundo `inert`. Perfil só permite salvar após carregar e oferece tentar novamente. Falhas de rampas não aparecem como lista vazia. O template de teste `index.ejs` e o seletor `#areaImagem` foram removidos. `npm test` executa verificações de perfil, upload, cliente e renderização EJS; detalhes em `TESTING.md`.

## 1) Top Risks (Prioritized)

| Severity | Concern | Evidence | Impact | Suggested action |
|----------|---------|----------|--------|------------------|
| high | Token JWT em `localStorage` em vez do cookie `HttpOnly` descrito na `conloq/mash#6` | `public/js/app.js` (`TOKEN_KEY`), issue #6 | Qualquer XSS no domínio lê o token e assume a sessão (perfil, exclusão de conta, receitas) | Decisão do time: adotar cookie `HttpOnly` no servidor EJS, ou aceitar e documentar o risco |
| high | O frontend depende de CORS que ainda não está em `main` no Back-End | `conloq/Back-End` branch `feat/cors-frontend` (`8b8518a`) | Mergeado o PR #4 sem o CORS, todas as chamadas falham no navegador | Mergear o PR de CORS antes ou junto; definir `FRONTEND_URL` no `.env` do Back-End (hoje ausente) |
| medium | Lotes, análises e leitura real de iodo ainda indisponíveis | `views/lots.ejs`, `views/lot.ejs`, `views/iodineDemo.ejs`, `views/analysis.ejs` | A consulta e o acompanhamento ainda não podem ser usados | Lotes e análises mostram indisponibilidade; teste de iodo é uma simulação sem persistência e sem etiqueta na tela, por decisão de 21/10/2026 (conloq/mash#9); integrar quando a API entregar as rotas |
| medium | `#listaReceitas` busca a temperatura de cada receita em paralelo, uma requisição por receita | `public/js/app.js` (`carregarReceitas`) | N+1: com muitas receitas, N requisições ao abrir a tela; a API não tem rota que traga as temperaturas junto | Aceitável no volume atual; revisar se a API ganhar `include` das temperaturas |
| low | `.omp/state/continuity.md` é artefato de agente, não versionado hoje | `git status` | Ruído no PR se for adicionado por engano | Manter fora do versionamento |
| low | `public/css/style.css` é artefato gerado e está versionado | `git ls-files`, `public/css/style.css` | Drift entre fonte Tailwind e CSS servido; conflito de merge em arquivo grande | Regenerar e commitar junto de toda mudança de classe |

## 2) Technical Debt

| Debt item | Why it exists | Where | Risk if ignored | Suggested fix |
|-----------|---------------|-------|-----------------|---------------|
| Logout só limpa o cliente | A API não revoga token | `public/js/app.js` (`sair`), `index.js` (`/logout`) | O token continua válido até expirar (1 dia) se for copiado antes do logout | Documentar; considerar endpoint de revogação no Back-End |
| Contrato HTML↔JS por string de seletor | Um script para todas as telas | `public/js/app.js` ↔ `views/**/*.ejs` | Renomear um `id` quebra o comportamento sem erro (`?.` engole a falha) | Comentar o contrato no topo do script ou testar presença de seletores |
| Linhas e mensagens vêm de `<template>` nas views | `clonar()` preenche `[data-slot]` com `textContent`/`setAttribute`, sem montar HTML com dados da API | `public/js/app.js`, `views/*.ejs` | Reintroduzir `innerHTML` com dados da API reabriria XSS | Manter dados só via `textContent`/`setAttribute` |
| Cache-busting manual | Forçar recarga do shell | `views/partials/footer.ejs` (`?v=5`) | Esquecer de incrementar faz o navegador servir JS antigo | Incrementar a cada mudança em `script.js` ou `app.js` |

## 3) Security Concerns

| Risk | OWASP category (if applicable) | Evidence | Current mitigation | Gap |
|------|--------------------------------|----------|--------------------|-----|
| Token legível por JavaScript | A07 Identification and Authentication Failures | `public/js/app.js` (`localStorage`) | Nenhuma | Risco aceito em 12/10/2026, quando o time trocou o cookie `HttpOnly` pelo `localStorage` (#6) |
| Injeção de atributo na lista de receitas | A03 Injection | `public/js/app.js` (`clonar`, `href`, `aria-label`) | Dados entram só por `textContent` e `setAttribute`; nenhum HTML é montado com dados da API | Evitar regressão para `innerHTML` |
| Sem CSP nem cabeçalhos de segurança | A05 Security Misconfiguration | `index.js`, `views/partials/header.ejs` | Nenhuma | Revisar antes de qualquer deploy |
| `FRONTEND_URL` ausente no `.env` do Back-End | A05 Security Misconfiguration | `conloq/Back-End/.env` | Código tem default `http://localhost:4000` | Em deploy, definir a origem real (senão o CORS bloqueia ou fica amplo demais) |
| Chave de API já removida do histórico recente | A02 Cryptographic Failures | commit `cf2dc27` | Removida do `opencode.json` | Verificar se a chave exposta foi rotacionada |

## 4) Performance and Scaling Concerns

| Concern | Evidence | Current symptom | Scaling risk | Suggested improvement |
|---------|----------|-----------------|-------------|-----------------------|
| N+1 de temperaturas por receita | `public/js/app.js` (`carregarReceitas`) | Nenhum no volume atual | Abrir `/recipes` com muitas receitas dispara N chamadas | Rota na API que devolva as temperaturas junto |
| `public/img/mash.png` (190,7 KB) sem otimização | scan, "Top 10 largest files" | Nenhum em local | Peso de página em conexão lenta | Comprimir/redimensionar antes de publicar |
| Compilação Tailwind manual | `package.json` (`build:css`) | Build esquecido faz classes novas não existirem | Telas quebradas silenciosamente | Rodar `watch:css` durante o desenvolvimento |

## 5) Fragile/High-Churn Areas

| Area | Why fragile | Churn signal | Safe change strategy |
|------|-------------|-------------|----------------------|
| `views/profile.ejs` | Maior template: perfil, edição, modal de foto e prévia | Maior template do scan | Alterar em blocos e reabrir `/profile` |
| `public/css/tailwind.css` | Contém o shell inteiro em `@layer components`, com media query de 1024px | Fonte do CSS servido | Rebuild obrigatório; conferir sidebar expandida/recolhida |
| `docs/` | Prosa histórica que descrevia o monólito antigo | `docs/superpowers/**` e `docs/frontend-*.md` | Tratar como histórico, não como estado atual |

## 6) Perguntas ao time (todas respondidas em 15/10/2026)

1. Resolvido em 12/10/2026 (decisão do Haimon, registrada na conloq/mash#66 e na #6): o token fica em `localStorage`; o risco de XSS foi aceito.
2. Decidido em 15/10/2026: sim, entra na conloq/mash#73. Pergunta original: os formulários de login e cadastro devem ganhar `method="post"` para não vazar credenciais na URL se o JS falhar?
3. Resolvido: o CORS entrou na `main` do Back-End em 13/10/2026 (conloq/Back-End#8); `FRONTEND_URL` é definida no deploy da API (conloq/mash#68).
4. Decidido em 15/10/2026: sim, a remoção dos PNGs órfãos de `public/icons/` e do `views/index.ejs` entra na conloq/mash#73. Feito: os dois foram removidos.
5. Decidido em 15/10/2026: ainda não; fica na conloq/mash#94, como Could, para depois do depósito. Pergunta original: deve existir algum pipeline (GitHub Actions) rodando `npm test` + `build:css` em PR, ou a revisão continua apenas com o CodeRabbit?

## 7) Evidence

- `docs/codebase/.codebase-scan.txt` (CODE METRICS, HIGH-CHURN FILES, CI/CD)
- `public/js/app.js`
- `views/login.ejs`, `views/signup.ejs`
- `views/lots.ejs`, `views/lot.ejs`, `views/iodineDemo.ejs`, `views/analysis.ejs`
- `views/partials/footer.ejs`
- `index.js`, `.env.example`, `.gitignore`
- `conloq/mash#6`, `conloq/mash#73`
