# #86: receitas e rampas integradas

Base: frontend main `83fd14587813f02aef1d2599efa8567713ce8b5e`. PR pareado com Back-End #32. Perfil phone/urlImage e multipart image preservados.

## Delta

Rotas/views em inglês para receitas, detalhe, edição do nome, criação de rampa e layouts de iodo. Chamadas diretas da API com Bearer, envelopes corretos, rampas camelCase, orderRamp opcional, limites inteiros 0–100, mínimo ≤ máximo e horários normalizados HH:MM:SS. Detalhe e edição do nome foram acrescentados. Visual atual mantido porque o design #78 não bloqueia a entrega. Edição/exclusão de rampas continuam na #97.

## Validação em 20/10/2026

API local em 127.0.0.1:8080, frontend em localhost:4000, MySQL 8.4.9 novo e isolado, contas sintéticas. Navegador Brave/Chromium headless via Playwright; desktop 1440×1000 e mobile 390×844. Nenhum erro JavaScript de página.

- Login inválido mostra 401 da API sem sair da tela; login válido guarda token e abre /recipes.
- Criar receita, listar, abrir detalhe e salvar novo nome com persistência real.
- Mínimo acima do máximo bloqueado pelo frontend; rampa com 0/100, horários e orderRamp enviada e consultada na API.
- Token inválido provoca 401, limpa storage e volta ao login. Visitante sem token também volta.
- Logout pelo botão Sair do perfil limpa token e redireciona. Estes quatro cenários de autenticação atendem à evidência pendente da #6.
- Mobile sem overflow horizontal global, tabela com rolagem interna; quatro inputs com min=0/max=100.
- `npm test`, `node --check public/js/app.js`, compilação dos 15 templates EJS, `npm run build:css`, `scripts/verify-upload.mjs` e `scripts/verify-profile-contract.mjs`: PASS.

## Reprodução manual

Com a API da #32 e um banco descartável: iniciar ambos os servidores; criar conta sintética e usar o navegador para repetir a sequência acima. Em /recipes, Adicionar receita; clicar no nome para detalhe/edição; adicionar rampa em /recipes/:id/temperatures/new. No perfil, Sair. Para sessão expirada, substituir mash-token por valor inválido e recarregar /recipes. Conferir mensagens e resultados de GET /recipes/:id/temperatures. Remover somente a conta criada pelo teste.

Capturas: [desktop](86-screens/recipes-desktop.png), [mobile](86-screens/recipes-mobile.png) e [rampa mobile](86-screens/ramp-mobile.png).

## Limite

API publicada: NÃO VERIFICADA. O critério de validação contra ambiente público continua pendente até #68/#69; evidência local não o substitui. O merge técnico pode ocorrer com esse limite explícito, sem declarar a #86 Done. PUT/DELETE usam operações existentes; vínculo com lotes permanece na #93.
