# #70 — campo da foto

Base: `71d58d9a2360b5851887aadae9c2456ca370c14d`.

O formulário enviava `imageUser`, divergente do contrato vigente `image`.
Somente o nome multipart foi alterado; layout e campos de perfil não mudam.

Reprodução: `node scripts/verify-upload.mjs`. Antes: FAIL (`imageUser`).
Depois: PASS (`image`, Bearer, browser define boundary e retorno ao perfil).
`npm test` e `git diff --check`: PASS.

O teste executa o JavaScript real em DOM/fetch simulados; não comprova
renderização visual nem envio ao Cloudinary real. Depende do PR pareado da
#70 no Back-End. Os campos camelCase do perfil permanecem no PR da #71.
