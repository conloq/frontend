# Technology Stack

## 1) Runtime Summary

| Area | Value | Evidence |
|------|-------|----------|
| Primary language | JavaScript (ES modules, `"type": "module"`) | `package.json` |
| Runtime + version | Node.js; versão não declarada (sem `engines`, sem `.nvmrc`) | `package.json` |
| Package manager | npm | `package-lock.json` |
| Module/build system | ES modules; Tailwind CSS v4 via CLI (`@tailwindcss/cli`) | `package.json`, `public/css/tailwind.css` |
| Tipo de aplicação | Servidor EJS com sessão; controller busca dados da API no servidor | `index.js`, `controllers/pageController.js` |

## 2) Production Frameworks and Dependencies

| Dependency | Version | Role in system | Evidence |
|------------|---------|----------------|----------|
| `express` | `^5.3.0` | Servidor HTTP, estáticos, roteamento das 26 rotas GET | `package.json`, `index.js` |
| `ejs` | `^7.0.2` | View engine dos templates em `views/` | `package.json`, `index.js` |
| `express-session` | `^1.19.0` | Sessão server-side para guardar o JWT fora do navegador | `package.json`, `index.js` |
| `express-mysql-session` | `^3.0.3` | Store persistente para a sessão Express na tabela `sessions` do MySQL existente | `package.json`, `index.js` |
| `@phosphor-icons/web` | `^2.1.2` | Fonte de ícones servida em `/vendor/phosphor` | `package.json`, `index.js`, `views/partials/header.ejs` |
| `nodemon` | `^3.1.14` | Execução de desenvolvimento (`npm start`); declarado em `dependencies` | `package.json` |

O cliente HTTP do servidor usa `fetch` nativo do Node; o browser envia formulários HTML same-origin ao controller. O frontend não acessa dados de domínio, mas conecta ao MySQL existente para ler e gravar sua tabela técnica de sessões.

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
npm run build:css          # tailwindcss -i public/css/tailwind.css -o public/css/style.css
npm run watch:css
npm start                  # nodemon index.js  (porta 4000)
npm test                   # sintaxe + scripts/verify-{profile-contract,upload,client}.mjs
npm run format             # Prettier em **/*.{js,mjs,css,json,html}
npm run format:check       # só confere a formatação
node --check public/js/app.js
```

## 5) Environment and Config

- Config sources: `package.json`, `index.js`, `public/css/tailwind.css`, `.env`, `.coderabbit.yaml`, `.prettierrc.json`, `.github/`.
- Required env vars: `SESSION_DB_HOST`, `SESSION_DB_USER`, `SESSION_DB_PASSWORD`, `SESSION_DB_NAME`; `SESSION_DB_PORT` opcional (padrão `3306`), `SESSION_DB_SSL` opcional no desenvolvimento, `SESSION_DB_SSL_CA` opcional para CA privada, `API_URL` opcional (padrão `http://localhost:8080`), `PORT` opcional (padrão `4000`) e `SESSION_SECRET` obrigatório em produção. `.env` é opcional.
- `.env.example` versionado com `PORT`, `API_URL`, `SESSION_SECRET` e `SESSION_DB_*`; `.gitignore` cobre `.env` e `.env.*` com exceção `!.env.example`.
- Deployment/runtime constraints: a tabela `sessions` precisa ser migrada no MySQL e a API precisa estar acessível pelo servidor frontend. Use credenciais restritas a essa tabela, TLS para MySQL e `SESSION_SECRET` forte. Não há deploy nem container configurado; o CI verifica com Super-Linter e CodeQL.

## 6) Evidence

- `package.json`
- `package-lock.json`
- `index.js`
- `.env.example`, `.gitignore`
- `public/css/tailwind.css`
- `docs/codebase/.codebase-scan.txt`
