# Coding Conventions

## 1) Naming Rules

| Item | Rule | Example | Evidence |
|------|------|---------|----------|
| Files (templates) | camelCase + `.ejs` | `temperatureForm.ejs`, `topBar.ejs` | `views/`, `views/partials/` |
| Files (JS) | camelCase | `index.js`, `app.js`, `script.js` | raiz, `public/js/` |
| Files (CSS) | kebab-case | `tailwind.css`, `style.css` | `public/css/` |
| Functions | camelCase, verbo + alvo; helpers de DOM de uma letra | `chamarApi`, `proteger`, `flash`, `clonar`, `confirmar`, `q`, `qa` | `controllers/pageController.js`, `public/js/app.js` |
| Constants/env vars | `UPPER_SNAKE` para constantes de módulo; `PORT`/`API_URL` do ambiente | `API`, `API_URL` | `controllers/pageController.js`, `index.js` |
| Rotas | inglês, minúsculas, plural nas coleções; todas as telas em inglês (`/signup`, `/profile`, `/settings`, `/dashboard`, `/forgot-password`) | `/recipes`, `/recipes/:id/temperatures/new`, `/logout` | `index.js` |
| Campos de formulário | inglês; os que vão para a API seguem o nome da API: camelCase (decisão de 08/10/2026, aplicada na #86); ids em pt-BR/camelCase | `name="minTemperatureRamp"` com `id="senha"` | `views/temperatureForm.ejs`, `views/login.ejs` |
| Atributos de ligação | `data-*` em kebab-case, valor em camelCase | `data-excluir-receita`, `data-sem-api` | `views/`, `public/js/app.js` |
| Tokens de tema | `--color-*` em pt-BR por função; prefixo `mash-` só nas cores de marca | `--color-acao`, `--color-texto-2`, `--color-perigo-suave`, `--color-mash-brown` | `public/css/tailwind.css` |

## 2) Formatting and Linting

- Formatter: Prettier (`.prettierrc.json`). JS com 4 espaços, aspas simples, ponto e vírgula, `trailingComma: es5` e linha de até 100 caracteres; JSON e CSS com 2 espaços e aspas duplas. `.prettierignore` deixa de fora `public/css/style.css`, `package-lock.json` e `docs/`. Os templates `.ejs` não são formatados (2 espaços por convenção).
- Pre-commit: o `npm install` instala um hook do husky; no `git commit`, o lint-staged roda `prettier --write` nos arquivos JS, CSS, JSON e HTML do staging e coloca o resultado no commit.
- Linter: ESLint com a configuração padrão do Super-Linter (`eslint:recommended`, globais de navegador e Node), só no CI. Não há configuração de ESLint no repositório.
- CI: o Super-Linter (`.github/workflows/super-linter.yml`) confere ESLint, Prettier e HTMLHint nos arquivos alterados, em PR e no `main`, e nunca faz commit. O CodeQL roda pelo default setup do GitHub.
- Most relevant enforced rules: `node --check` para sintaxe; `no-unused-vars` do ESLint; o build Tailwind falha se `@source`/`@import` estiver inválido.
- Run commands: `npm test`, `node --check <arquivo>.js`, `npm run format`, `npm run format:check`, `npm run build:css`.
- Revisão de PR: `.coderabbit.yaml` (pt-BR, perfil `chill`, revisão automática dos PRs para o `main`, resumo no comentário do CodeRabbit, sem exigir testes automatizados). Usa o `AGENTS.md` como guia de revisão, ignora arquivos gerados (`style.css`, `package-lock.json`, `docs/design/`, `docs/figma-export/`) e não roda o Biome. Ele leva cerca de 10 minutos para começar: espere o comentário antes do merge.

## 3) Import and Module Conventions

- Import grouping/order: `node:` primeiro, depois pacotes (`express`).
- Alias vs relative import policy: apenas caminhos relativos/`node:`; sem aliases.
- Public exports/barrel policy: `index.js` não exporta nada (executa e faz `listen`). `public/js/app.js` e `public/js/script.js` são scripts clássicos (IIFE no caso do `app.js`), não módulos: não usam `import`/`export`.
- Ordem de carregamento: `footer.ejs` carrega `script.js` e depois `app.js`; API_URL e JWT nunca são expostos ao browser.

## 4) Error and Logging Conventions

- Error strategy by layer: o controller trata falhas de rede da API como `503` e usa flash de sessão para erros de operação; validações de interface mostram erros junto aos campos. No servidor, `index.js` não tem `try/catch` por rota e usa o 404 padrão do Express; falha de bind é tratada no evento `error` do servidor.
- Logging style and required context fields: no servidor, apenas duas linhas: sucesso do `listen` (`console.log`) e falha de bind (`console.error`). Nenhum `console.*` em `public/js/`.
- Sensitive-data redaction rules: nenhum segredo no código; JWT fica na sessão server-side e não é logado. `SESSION_SECRET` fica no ambiente e `.env` fora do versionamento.

## 5) Testing Conventions

- Test file naming/location rule: scripts assert-based em `scripts/verify-*.mjs`, executados por `npm test`.
- Mocking strategy norm: APIs/DOM simulados onde necessário; EJS renderiza os contratos das views sem API real.
- Coverage expectation: checks de contrato nas rotas de apresentação e interações alteradas; não há coleta de cobertura.

## 6) Evidence

- `index.js`
- `public/js/app.js`
- `public/js/script.js`
- `views/partials/footer.ejs`
- `public/css/tailwind.css`
- `.coderabbit.yaml`
- `.prettierrc.json`, `.prettierignore`, `.husky/pre-commit`, `package.json` (`lint-staged`)
- `.github/workflows/super-linter.yml`

## Receitas e rampas: integração da #86

O controller consome `GET/POST /recipes`, `GET /recipes/:id` e `GET/POST /recipes/:id/temperatures` da #32. Lista, detalhe e rampas são passados às views por locais EJS. A tela usa `minTemperatureRamp`, `maxTemperatureRamp`, `minTemperatureLimit`, `maxTemperatureLimit`, `timer`, `initialization`, `idealTime` e `orderRamp` opcional. Temperaturas inteiras entre 0 e 100 °C, mínimo ≤ máximo; horários HH:MM:SS.

Rotas de tela: `/recipes` (`recipes.ejs`), `/recipes/:id` e `/recipes/:id/edit` (`recipe.ejs`) e `/recipes/:id/temperatures/new` e `/recipes/:id/temperatures/:temperatureId/edit` (`temperatureForm.ejs`). Lotes e análises mostram estados de indisponibilidade até a integração com a API. O teste de iodo em `/analyses/new` é uma simulação com dados locais, sem persistência e sem etiqueta de simulação na tela (decisão de 21/10/2026, conloq/mash#9). Edição e exclusão de rampas permanecem na #97. O visual segue o redesign v2 de `docs/design/mash.pen`.

Detalhe, criação, edição do nome e exclusão de receita usam chamadas reais com Bearer no servidor. PUT/DELETE existentes foram alinhados ao caminho em inglês para preservar a interface; a conclusão das regras da #93, incluindo vínculo com lotes, continua naquela issue. Perfil mantém phone/urlImage da #71. O design atual é mantido pela regra da #78, sem bloqueio por desenho ausente. Validação pública ainda depende do deploy #68/#69; evidência local não equivale a deploy.
