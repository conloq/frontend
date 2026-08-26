# views/partials/

## Responsibility

Fornece componentes EJS reutilizáveis para o shell autenticado e o carregamento de recursos.

## Design

- `header.ejs`: metadados HTML, stylesheet compilado e Phosphor Icons.
- `footer.ejs`: scripts e fechamento da estrutura HTML.
- `sidebar.ejs`: navegação lateral, perfil e drawer mobile.
- `topBar.ejs`: barra superior e controles mobile.

## Flow

As páginas autenticadas incluem `sidebar.ejs` e `topBar.ejs`, enquanto `header.ejs` e `footer.ejs` envolvem o conteúdo. Os partials leem `usuario` disponibilizado por `infoGlobal` e por objetos passados pelo controller.

## Integration

- Incluídos por `views/usuario.ejs`, `receita.ejs` e telas de temperatura/iodo.
- Dependem de IDs/classes consumidos por `public/js/script.js`.
- Dependem de `/css/style.css` e `/vendor/phosphor/src/regular/style.css`.
