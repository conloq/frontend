# Testing Patterns

`npm test` verifica a sintaxe de `index.js` e executa três scripts com `node:assert/strict`, `node:vm` e EJS, sem API, banco ou framework de testes:

- `scripts/verify-profile-contract.mjs`: valores do usuário chegam escapados ao HTML EJS e a gravação usa POST para o controller do frontend.
- `scripts/verify-upload.mjs`: contrato de multipart do browser e encaminhamento pela sessão server-side.
- `scripts/verify-client.mjs`: `API_URL` carregada após importar o controller, configuração da sessão MySQL, formulários POST, foco/restauração de `inert`, placeholders em inputs compatíveis, compilação dos templates e escape de atributo no modal.

O store MySQL exige tabela e credenciais para iniciar o servidor; os checks locais não conectam ao banco. Para validar esse caminho, iniciar o frontend com a migration aplicada e as variáveis `SESSION_DB_*` configuradas.

Os testes não substituem verificação em navegador desktop/mobile com a API real, especialmente para layout, autenticação, armazenamento de sessão e upload multipart.

Outras verificações: `node --check public/js/app.js`, `node --check public/js/script.js`, `npm run format:check` e `npm run build:css`. O CSS gerado é versionado; regenere após mudanças de classes ou da fonte Tailwind.

O CI Super-Linter verifica sintaxe/estilo dos arquivos alterados; ainda não executa `npm test` nem o build CSS.
