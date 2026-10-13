# Technology Stack

## 1) Runtime Summary

| Area | Value | Evidence |
|------|-------|----------|
| Primary language | JavaScript (ES modules, `"type": "module"`) | `package.json` |
| Runtime + version | Node.js; versão não declarada (sem `engines`, sem `.nvmrc`) | `package.json` |
| Package manager | npm | `package-lock.json` |
| Module/build system | ES modules; Tailwind CSS v4 via CLI (`@tailwindcss/cli`) | `package.json`, `public/css/tailwind.css` |
| Tipo de aplicação | Servidor EJS que entrega páginas; o navegador consome a API | `index.js`, `public/js/app.js` |

## 2) Production Frameworks and Dependencies

| Dependency | Version | Role in system | Evidence |
|------------|---------|----------------|----------|
| `express` | `^5.3.0` | Servidor HTTP, estáticos, roteamento das 10 rotas GET | `package.json`, `index.js` |
| `ejs` | `^5.0.2` | View engine dos templates em `views/` | `package.json`, `index.js` |
| `@phosphor-icons/web` | `^2.1.2` | Fonte de ícones servida em `/vendor/phosphor` | `package.json`, `index.js`, `views/partials/header.ejs` |
| `nodemon` | `^3.1.14` | Execução de desenvolvimento (`npm start`); declarado em `dependencies` | `package.json` |

O cliente HTTP é o `fetch` nativo do navegador — não há axios, ky ou similar. Não há dependência de banco, ORM, sessão, autenticação, upload, cookie ou framework de UI neste repositório.

## 3) Development Toolchain

| Tool | Purpose | Evidence |
|------|---------|----------|
| `tailwindcss` + `@tailwindcss/cli` (`^4.3.3`) | BUILD — compilação/watch do CSS | `package.json`, `public/css/tailwind.css` |
| `node --check` | CHECK — verificação sintática; é todo o `npm test` | `package.json` |
| CodeRabbit (`.coderabbit.yaml`) | REVIEW — revisão automática de PRs para `main`, perfil `chill`, pt-BR | `.coderabbit.yaml` |
| Linter / formatter / typechecker | Nenhum configurado | scan sem configuração de lint/format |
| CI/CD, containers, coverage | Nenhum detectado | scan: "No CI/CD pipelines detected" |

## 4) Key Commands

```bash
npm install
npm run build:css          # npx @tailwindcss/cli -i public/css/tailwind.css -o public/css/style.css
npm run watch:css
npm start                  # npx nodemon index.js  (porta 4000)
npm test                   # node --check index.js  (sai com 0; não é suíte de testes)
node --check public/js/app.js
```

## 5) Environment and Config

- Config sources: `package.json`, `index.js`, `public/css/tailwind.css`, `.env`, `.coderabbit.yaml`.
- Required env vars: `API_URL` (opcional; padrão `http://localhost:8080`) e `PORT` (opcional; padrão `4000`). `.env` é opcional — `index.js` chama `process.loadEnvFile()` dentro de `try/catch`.
- `.env.example` versionado com `PORT` e `API_URL`; `.gitignore` cobre `.env` e `.env.*` com exceção `!.env.example`.
- Deployment/runtime constraints: **a API precisa estar rodando** em `API_URL`, senão todas as telas carregam mas o cliente devolve 503. O Back-End precisa liberar CORS para a origem do frontend (`FRONTEND_URL`, padrão `http://localhost:4000`). Não há deploy, container ou pipeline configurado.

## 6) Evidence

- `package.json`
- `package-lock.json`
- `index.js`
- `.env.example`, `.gitignore`
- `public/css/tailwind.css`
- `docs/codebase/.codebase-scan.txt`
