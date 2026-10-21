# Testing Patterns

`npm test` verifica a sintaxe de `index.js` e executa três scripts com `node:assert/strict` e `node:vm`, sem API, banco ou framework de testes:

- `scripts/verify-profile-contract.mjs`: leitura de foto/telefone, atualização com Bearer, confirmação de senha no fixture e recarga do perfil sem redirecionar.
- `scripts/verify-upload.mjs`: multipart com campo `image`, Bearer, Content-Type definido pelo navegador e foto atualizada sem redirecionar.
- `scripts/verify-client.mjs`: 401 atrasado preserva token novo, 401 atual remove sessão, timeout de 15 s inclusive na leitura do corpo, aviso de gravação incerta, erro versus ausência de rampas, bloqueio do perfil sem dados, foco e restauração de `inert`, method POST nos formulários com senha e compilação/renderização EJS.

Os testes usam respostas e DOM simulados. Não substituem verificação em navegador desktop/mobile com a API real, especialmente para foco, layout, autenticação e persistência.

Outras verificações: `node --check public/js/app.js`, `node --check public/js/script.js`, `npm run format:check` e `npm run build:css`. O CSS gerado é versionado; regenere após mudanças de classes ou da fonte Tailwind.

O CI Super-Linter verifica sintaxe/estilo dos arquivos alterados; ainda não executa `npm test` nem o build CSS.
