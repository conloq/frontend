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
| `express` | `^5.3.0` | Servidor HTTP, estáticos, roteamento das 14 rotas GET | `package.json`, `index.js` |
| `ejs` | `^7.0.2` | View engine dos templates em `views/` | `package.json`, `index.js` |
| `@phosphor-icons/web` | `^2.1.2` | Fonte de ícones servida em `/vendor/phosphor` | `package.json`, `index.js`, `views/partials/header.ejs` |
| `nodemon` | `^3.1.14` | Execução de desenvolvimento (`npm start`); declarado em `dependencies` | `package.json` |

O cliente HTTP é o `fetch` nativo do navegador: não há axios, ky ou similar. Não há dependência de banco, ORM, sessão, autenticação, upload, cookie ou framework de UI neste repositório.

## 3) Development Toolchain

| Tool | Purpose | Evidence |
|------|---------|----------|
| `tailwindcss` + `@tailwindcss/cli` (`^4.3.3`) | BUILD: compilação/watch do CSS | `package.json`, `public/css/tailwind.css` |
| `node --check` | CHECK: sintaxe do servidor; `npm test` também executa verificações com assert/VM e renderização EJS | `package.json` |
| CodeRabbit (`.coderabbit.yaml`) | REVIEW: revisão automática de PRs para `main`, perfil `chill`, pt-BR | `.coderabbit.yaml` |
| `prettier` (`^3.9.10`) | FORMAT: formatação de JS, CSS, JSON e HTML (`.prettierrc.json`) | `package.json`, `.prettierrc.json` |
| `husky` (`^9.1.7`) + `lint-staged` (`^17.6.0`) | FORMAT: hook de pre-commit que roda o Prettier nos arquivos do staging | `package.json`, `.husky/pre-commit` |
| Super-Linter (`v9.0.0`) | CI: ESLint, Prettier e HTMLHint nos arquivos alterados, em PR e no `main` | `.github/workflows/super-linter.yml` |
| CodeQL | CI: análise de segurança do JavaScript pelo default setup do GitHub (sem arquivo no repositório) | configuração do repositório no GitHub |
| Dependabot | Atualização semanal de dependências npm e de GitHub Actions | `.github/dependabot.yml` |
| Typechecker, containers, coverage | Nenhum configurado | `package.json` |

## 4) Key Commands

```bash
npm install
npm run build:css          # npx @tailwindcss/cli -i public/css/tailwind.css -o public/css/style.css
npm run watch:css
npm start                  # npx nodemon index.js  (porta 4000)
npm test                   # sintaxe + scripts/verify-{profile-contract,upload,client}.mjs
npm run format             # Prettier em **/*.{js,mjs,css,json,html}
npm run format:check       # só confere a formatação
node --check public/js/app.js
```

## 5) Environment and Config

- Config sources: `package.json`, `index.js`, `public/css/tailwind.css`, `.env`, `.coderabbit.yaml`, `.prettierrc.json`, `.github/`.
- Required env vars: `API_URL` (opcional; padrão `http://localhost:8080`) e `PORT` (opcional; padrão `4000`). `.env` é opcional: `index.js` chama `process.loadEnvFile()` dentro de `try/catch`.
- `.env.example` versionado com `PORT` e `API_URL`; `.gitignore` cobre `.env` e `.env.*` com exceção `!.env.example`.
- Deployment/runtime constraints: **a API precisa estar rodando** em `API_URL`, senão todas as telas carregam mas o cliente devolve 503. O Back-End precisa liberar CORS para a origem do frontend (`FRONTEND_URL`, padrão `http://localhost:4000`). Não há deploy nem container configurado; o CI verifica com Super-Linter e CodeQL. O Super-Linter usa `statuses: write` para os resultados e `pull-requests: write` para comentar o resumo no PR.

## 6) Evidence

- `package.json`
- `package-lock.json`
- `index.js`
- `.env.example`, `.gitignore`
- `public/css/tailwind.css`
- `docs/codebase/.codebase-scan.txt`
