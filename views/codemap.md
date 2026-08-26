# views/

## Responsibility

Renderiza as páginas HTML da aplicação com EJS e os dados fornecidos pelos controllers.

## Design

- `login.ejs` e `cadastro.ejs` formam o fluxo público de autenticação.
- `usuario.ejs` exibe perfil, edição, upload de foto e histórico de logins.
- `receita.ejs` lista receitas e ações de temperatura.
- `adicionarTemperatura.ejs`/`editarTemperatura.ejs` tratam temperaturas.
- `adicionarIodo.ejs`/`editarIodo.ejs` tratam iodo.
- `partials/` contém o shell compartilhado.

## Flow

Controllers chamam `res.render(...)` com dados como `user`, `receitas`, `temperatura`, `iodo` e `receitaId`. Formulários enviam POST para os endpoints em `routes/`; links GET navegam para telas protegidas.

## Integration

- Renderizadas pelo Express configurado em `index.js`.
- Usam `views/partials/header.ejs`, `footer.ejs`, `sidebar.ejs` e `topBar.ejs`.
- Carregam `/css/style.css`, `/js/script.js` e Phosphor via `/vendor/phosphor`.
- Classes Tailwind são coletadas pela fonte em `public/css/tailwind.css`.
