# Coding Conventions

## 1) Naming Rules

| Item | Rule | Example | Evidence |
|------|------|---------|----------|
| Files (templates) | camelCase + `.ejs` | `adicionarTemperatura.ejs`, `topBar.ejs` | `views/`, `views/partials/` |
| Files (JS) | camelCase | `index.js`, `app.js`, `script.js` | raiz, `public/js/` |
| Files (CSS) | kebab-case | `tailwind.css`, `style.css` | `public/css/` |
| Functions | camelCase, verbo + alvo; helpers de DOM de uma letra | `carregarUsuario`, `carregarReceitas`, `mostrarMensagem`, `irPara`, `sair`, `escapar`, `q`, `qa` | `public/js/app.js` |
| Constants/env vars | `UPPER_SNAKE` para constantes de módulo; `PORT`/`API_URL` do ambiente | `TOKEN_KEY`, `FLASH_KEY`, `ESTILOS` | `public/js/app.js`, `index.js` |
| Rotas | pt-BR, minúsculas, plural nas coleções | `/receitas`, `/receitas/temperatura/cadastrar/:id`, `/logout` | `index.js` |
| Campos de formulário | inglês, snake_case nos que vão para a API; ids em pt-BR/camelCase | `name="min_temperature_ramp"` com `id="senha"` | `views/adicionarTemperatura.ejs`, `views/login.ejs` |
| Atributos de ligação | `data-*` em kebab-case, valor em camelCase | `data-user="url_image"`, `data-excluir` | `views/partials/topBar.ejs`, `public/js/app.js` |
| Tokens de tema | prefixo `mash-` | `--color-mash-brown`, `--color-mash-orange`, `--color-mash-cream` | `public/css/tailwind.css` |

## 2) Formatting and Linting

- Formatter: nenhum configurado (sem Prettier/EditorConfig).
- Linter: nenhum configurado (sem ESLint/Stylelint).
- Estilo observado: indentação de 2 espaços em `index.js`, EJS e CSS; 4 espaços em `public/js/app.js` e `script.js`; aspas simples no JS do cliente, aspas duplas em `index.js`.
- Most relevant enforced rules: `node --check` para sintaxe; o build Tailwind falha se `@source`/`@import` estiver inválido.
- Run commands: `npm test`, `node --check <arquivo>.js`, `npm run build:css`.
- Revisão de PR: `.coderabbit.yaml` (pt-BR, perfil `chill`, sem exigir testes automatizados; foco em segurança, tratamento de erros e contrato da issue).

## 3) Import and Module Conventions

- Import grouping/order: `node:` primeiro, depois pacotes (`express`).
- Alias vs relative import policy: apenas caminhos relativos/`node:`; sem aliases.
- Public exports/barrel policy: `index.js` não exporta nada (executa e faz `listen`). `public/js/app.js` e `public/js/script.js` são scripts clássicos (IIFE no caso do `app.js`), não módulos — não usam `import`/`export`.
- Ordem de carregamento: `footer.ejs` carrega `script.js?v=4` e depois `app.js`; `app.js` depende de `window.API_URL`, definido no mesmo arquivo antes dos scripts.

## 4) Error and Logging Conventions

- Error strategy by layer: no cliente, `api()` captura falha de rede e devolve `503` com mensagem pt-BR; erros de negócio viram texto em `#mensagens` (nunca `alert`). No servidor, `index.js` não tem `try/catch` por rota e usa o 404 padrão do Express; falha de bind é tratada no evento `error` do servidor.
- Logging style and required context fields: no servidor, apenas duas linhas — sucesso do `listen` (`console.log`) e falha de bind (`console.error`). Nenhum `console.*` em `public/js/`.
- Sensitive-data redaction rules: nenhum segredo no código; o token fica em `localStorage` e não é logado. `.env` fora do versionamento.

## 5) Testing Conventions

- Test file naming/location rule: NONE — não existem arquivos de teste.
- Mocking strategy norm: NONE.
- Coverage expectation: NONE. O CodeRabbit sinaliza cobertura de docstring (62,5% no diff), não cobertura de teste.

## 6) Evidence

- `index.js`
- `public/js/app.js`
- `public/js/script.js`
- `views/partials/footer.ejs`
- `public/css/tailwind.css`
- `.coderabbit.yaml`
