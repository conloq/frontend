# public/js/

## Responsibility

Implementa interações de navegação e formulários no navegador sem framework.

## Design

`script.js` usa helpers `$`/`$$`, listeners condicionais e classes CSS para operar em páginas que compartilham os mesmos partials. `app.js` roda dentro de uma IIFE (para não colidir com os globais do `script.js`) e concentra o consumo da API. Não há módulos ou dependências de frontend adicionais.

## Flow

- Persiste o estado recolhido da sidebar em `localStorage` usando `mash-sidebar-collapsed`.
- Controla sidebar desktop/mobile e fecha overlays com `Escape` ou clique.
- Marca o link de navegação correspondente à URL atual.
- Marca o item ativo do menu pela seção (`data-secao`, `*` vale um trecho; vence a seção mais longa) e troca o ícone para o peso Fill.
- Recuperar senha: as 6 caixas `[data-codigo]` avançam, voltam no Backspace e aceitam colar; `[data-reenviar]` conta até zero e libera o botão.
- Perfil: escolher o arquivo em `#inputFoto` mostra a prévia e já envia `#formFoto` ("Trocar foto" em um passo).
- Alterna visibilidade da senha (`data-toggle-senha`).
- Gera preview local de foto com `FileReader`.
- Abre/fecha modais; `prenderFoco()` mantém Tab no diálogo, aplica `inert` ao fundo e restaura o foco ao fechar. `app.js` usa o mesmo controle na confirmação.
- `app.js`: guarda de rota por token, login, cadastro, perfil, foto, receitas e criação de rampa, `fetch` com Bearer e tratamento de 401 somente para o token usado na chamada e timeout de 15 segundos. O perfil só habilita salvar após carregar; falhas mostram uma ação de tentar novamente. Clona os `<template>` das views (`clonar`), mostra sucesso como toast e erro/aviso como alerta, confirma exclusões com `confirmar()` e marca erro por campo (`erroCampo`). As ações `data-sem-api` restantes (rampas) exibem aviso. O teste de iodo mantém coletas e temporizadores de demonstração, sem persistência; lotes e consultas de análises não exibem dados fictícios.

## Integration

- Carregados por todas as páginas através de `views/partials/footer.ejs` (`/js/script.js?v=6` e `/js/app.js?v=9`, depois de `window.API_URL`).
- `app.js` chama a API do Back-End direto do navegador (CORS liberado lá) e guarda `mash-token` e `mash-flash` no `localStorage`.
- Depende de IDs/classes e atributos `data-*` definidos em `views/*.ejs` e `views/partials/*.ejs`.
- Suas classes são incluídas na compilação por `public/css/tailwind.css`.
