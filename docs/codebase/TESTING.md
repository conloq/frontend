# Testing Patterns

`npm test` roda `node --test scripts/verify-frontend.mjs`, com `node:test` e `node:assert/strict`, sem API, banco nem framework de testes:

- a camada de API usa `axios.create`, `NEXT_PUBLIC_API_URL`, Bearer no interceptor e trata o `401`; não existem mais `controllers/pageController.js` nem `index.js`;
- o login chama `signIn`, e `auth.js` usa `POST /login` e `GET /user`, que o `AppShell` consulta;
- `validarRampa` (`src/services/rampa.js`) aceita uma rampa válida e marca temperatura fora de 0 a 100, mínima maior que máxima e horário inválido;
- nenhum componente usa `dangerouslySetInnerHTML`.

Outras verificações: `npm run lint`, `npm run format:check`, `npm run build:css` e `npm run build` (compila as 28 rotas). Rode o `next build` na raiz do repositório.

Os testes não substituem a verificação em navegador desktop e mobile com MySQL, o Back-End na 8080 e este app na 4000, especialmente para login, upload, `401` e layout.

O CI Super-Linter verifica sintaxe e estilo dos arquivos alterados; ainda não executa `npm test` nem o build.
