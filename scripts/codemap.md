# scripts/

Verificações locais executadas por `npm test` (`node --test`), sem API nem banco.

- `verify-frontend.mjs`:
  - a camada de API usa `axios.create`, `NEXT_PUBLIC_API_URL`, Bearer por `getAxiosConfig()` em toda chamada e trata o `401`; não sobrou controller nem `index.js` do app EJS;
  - login chama `login`, e `auth.js` usa `POST /login` e `GET /user`, que o `AppShell` consulta;
  - `validarRampa` (`src/services/rampa.js`) aceita uma rampa válida e marca temperatura fora de 0 a 100, mínima maior que máxima e horário inválido;
  - nenhum componente usa `dangerouslySetInnerHTML`.

Os testes são checks de contrato; verifique também os fluxos no navegador com a API real quando mudar autenticação ou interface.
