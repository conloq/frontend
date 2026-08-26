# public/js/

## Responsibility

Implementa interações de navegação e formulários no navegador sem framework.

## Design

`script.js` usa helpers `$`/`$$`, listeners condicionais e classes CSS para operar em páginas que compartilham os mesmos partials. Não há módulos ou dependências de frontend adicionais.

## Flow

- Persiste o estado recolhido da sidebar em `localStorage` usando `mash-sidebar-collapsed`.
- Controla sidebar desktop/mobile e fecha overlays com `Escape` ou clique.
- Marca o link de navegação correspondente à URL atual.
- Alterna visibilidade da senha.
- Habilita edição do formulário de perfil.
- Gera preview local de foto com `FileReader`.
- Abre/fecha modais e gerencia foco inicial.

## Integration

- Carregado pelas páginas através de `views/partials/footer.ejs` ou header, conforme composição dos templates.
- Depende de IDs/classes e atributos `data-*` definidos em `views/*.ejs` e `views/partials/*.ejs`.
- Suas classes são incluídas na compilação por `public/css/tailwind.css`.
