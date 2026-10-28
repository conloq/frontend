# Technology Stack

## 1) Runtime Summary

| Area | Value | Evidence |
|------|-------|----------|
| Primary language | JavaScript com JSX (sem TypeScript) | `src/` |
| Runtime + version | Node.js; versão não declarada (sem `engines`, sem `.nvmrc`) | `package.json` |
| Package manager | npm | `package-lock.json` |
| Framework | Next.js 16 (Pages Router, Turbopack) com React 18 | `package.json`, `src/pages/` |
| CSS | Tailwind CSS v4 via CLI (`@tailwindcss/cli`), saída em `public/css/style.css` | `package.json`, `public/css/tailwind.css` |
| Tipo de aplicação | Páginas estáticas do Next que chamam a API pelo navegador | `src/services/api.js` |

## 2) Production Frameworks and Dependencies

| Dependency | Version | Role in system | Evidence |
|------------|---------|----------------|----------|
| `next` | `16.4.3` | Roteamento por arquivos, build e servidor (`next start`) | `package.json` |
| `react`, `react-dom` | `^18` | Componentes das telas | `package.json` |
| `axios` | `^1.8.4` | Cliente HTTP da API, com interceptores | `src/services/api.js` |
| `@phosphor-icons/web` | `^2.1.2` | Fonte de ícones (`regular` e `fill`) | `src/pages/_app.js` |

## 3) Development Toolchain

| Tool | Purpose | Evidence |
|------|---------|----------|
| `tailwindcss` + `@tailwindcss/cli` (`^4.3.3`) | BUILD: compilação/watch do CSS | `package.json` |
| `eslint` (`^9`) + `eslint-config-next` (`16.4.3`) | LINT: `npm run lint` | `eslint.config.mjs` |
| `node --test` | CHECK: `scripts/verify-frontend.mjs` | `package.json` |
| `prettier` (`^3.9.10`) | FORMAT: JS, CSS, JSON e HTML | `.prettierrc.json` |
| `husky` + `lint-staged` | FORMAT: Prettier no pre-commit | `.husky/pre-commit` |
| Super-Linter (`v9.0.0`) | CI: ESLint, Prettier e HTMLHint nos arquivos alterados | `.github/workflows/super-linter.yml` |
| CodeQL | CI: análise de segurança pelo default setup do GitHub | configuração do repositório |
| CodeRabbit | REVIEW: revisão automática de PRs, pt-BR | `.coderabbit.yaml` |
| Dependabot | Atualização semanal de npm e GitHub Actions | `.github/dependabot.yml` |
| Typechecker, containers, coverage | Nenhum configurado | `package.json` |

## 4) Key Commands

```bash
npm install
npm run dev                # next dev -p 4000
npm run build              # build:css + next build
npm start                  # next start -p 4000
npm run build:css          # tailwindcss -i public/css/tailwind.css -o public/css/style.css
npm run watch:css
npm test                   # node --test scripts/verify-frontend.mjs
npm run lint               # eslint .
npm run format             # Prettier em **/*.{js,mjs,css,json,html}
npm run format:check
```

## 5) Environment and Config

- Config sources: `package.json`, `next.config.mjs` (`reactStrictMode`), `jsconfig.json` (alias `@/`), `eslint.config.mjs`, `public/css/tailwind.css`, `.env`.
- Env var: `NEXT_PUBLIC_API_URL` (opcional, padrão `http://localhost:8080`). `.gitignore` cobre `.env`, `.env.*` (exceto `.env.example`) e `.next`.
- Deploy: Render, com Build Command `npm install --include=dev && npm run build` e Start Command `npm start`. O Back-End precisa de `FRONTEND_URL` com a URL do frontend.
