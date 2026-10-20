# public/js/

## Responsibility

Implementa interações de navegação e formulários no navegador sem framework.

## Design

`script.js` usa helpers `$`/`$$`, listeners condicionais e classes CSS para operar em páginas que compartilham os mesmos partials. `app.js` roda dentro de uma IIFE (para não colidir com os globais do `script.js`) e concentra o consumo da API. Não há módulos ou dependências de frontend adicionais.

## Flow

- Persiste o estado recolhido da sidebar em `localStorage` usando `mash-sidebar-collapsed`.
- Controla sidebar desktop/mobile e fecha overlays com `Escape` ou clique.
- Marca o link de navegação correspondente à URL atual.
- Marca o item ativo do menu pela seção (`data-secao`) e troca o ícone para o peso Fill.
- Alterna visibilidade da senha (`data-toggle-senha`).
- Gera preview local de foto com `FileReader`.
- Abre/fecha modais e gerencia foco inicial.
- `app.js`: guarda de rota por token, login, cadastro, perfil, foto, receitas e criação de rampa, `fetch` com Bearer e tratamento de 401. Clona os `<template>` das views (`clonar`), mostra sucesso como toast e erro/aviso como alerta, confirma exclusões com `confirmar()` e marca erro por campo (`erroCampo`). Nas telas de lotes e iodo (dados de exemplo) só cuida de filtro, do aviso `data-sem-api` e da demonstração do teste de iodo.

## Integration

- Carregados por todas as páginas através de `views/partials/footer.ejs` (`/js/script.js?v=5` e `/js/app.js?v=5`, depois de `window.API_URL`).
- `app.js` chama a API do Back-End direto do navegador (CORS liberado lá) e guarda `mash-token` e `mash-flash` no `localStorage`.
- Depende de IDs/classes e atributos `data-*` definidos em `views/*.ejs` e `views/partials/*.ejs`.
- Suas classes são incluídas na compilação por `public/css/tailwind.css`.
