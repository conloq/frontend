# views/partials/

## Responsibility

Componentes EJS reutilizáveis que formam o shell das páginas e o carregamento de recursos do navegador.

## Design

- `header.ejs`: doctype, `lang="pt-BR"`, viewport, título "Projeto Cervejaria" e os links para `/vendor/phosphor/src/regular/style.css` e `/css/style.css`.
- `footer.ejs`: carrega `/js/script.js?v=4` e fecha `body`/`html`.
- `sidebar.ejs`: `<aside id="appSidebar">` com logo, links `/usuario` (Painel), `/receita` (Receitas) e `#` (Configuração), controles `.sidebar-collapse` (desktop) e `.sidebar-close` (mobile), e o `<div id="sidebarOverlay">`.
- `topBar.ejs`: botão `.sidebar-open` (mobile, `aria-controls="appSidebar"`) e link para o perfil com nome/e-mail fixos.

## Flow

`header.ejs` e `footer.ejs` envolvem todas as telas; `sidebar.ejs` e `topBar.ejs` aparecem apenas nas telas autenticadas. `topBar.ejs` tem nome, e-mail e foto marcados com `data-user`, que o `public/js/app.js` preenche com `GET /user`; `mensagens.ejs` é só a área `#mensagens`; `footer.ejs` define `window.API_URL`.

## Integration

- Incluídos por `views/login.ejs`, `views/cadastro.ejs`, `views/usuario.ejs`, `views/receita.ejs`, `views/adicionarTemperatura.ejs`, `views/editarTemperatura.ejs`, `views/adicionarIodo.ejs` e `views/editarIodo.ejs`.
- Dependem de IDs/classes consumidos por `public/js/script.js` (`#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link`).
- Dependem de `/css/style.css`, `/js/script.js` e `/vendor/phosphor/src/regular/style.css`, servidos por `index.js`.

## Evidências

- `views/partials/header.ejs`
- `views/partials/footer.ejs`
- `views/partials/sidebar.ejs`
- `views/partials/mensagens.ejs`
- `views/partials/topBar.ejs`
- `public/js/script.js`
