# scripts/

Verificações locais executadas por `npm test`, com módulos nativos assert/VM e EJS já instalado. Não chamam a API real.

- `verify-profile-contract.mjs`: contrato camelCase do perfil, PUT com Bearer e recarga sem navegação.
- `verify-upload.mjs`: upload multipart e atualização da imagem sem navegação.
- `verify-client.mjs`: regressões de sessão, timeout, estados de rampas, perfil e foco; verifica POST nos formulários sensíveis e compila/renderiza as telas EJS.

Os dois primeiros aceitam um caminho alternativo de `app.js` como primeiro argumento. Os fixtures representam somente o DOM usado nos testes; verifique também os fluxos no navegador quando mudar a interface.
