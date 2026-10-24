# views/partials/

Partials compartilhados pelas páginas EJS. Dados de usuário e conteúdo dinâmico inicial vêm dos locals enviados pelo controller de páginas.

- `header.ejs`: metadados, CSS e ícones.
- `footer.ejs`: diálogo de confirmação, molde `tplAlerta` e scripts; não injeta API_URL.
- `shellInicio.ejs` / `shellFim.ejs`: moldura das páginas autenticadas.
- `topBar.ejs`: imprime `user.name`, `user.email` e `user.urlImage` com EJS escapado.
- `sidebar.ejs`: navegação do shell.
- `mensagens.ejs`: flash de sessão renderizado no servidor.
- `cardAcessos.ejs`: renderiza acessos recebidos pelo controller e estados de erro/vazio.
- `modalLote.ejs`: opções de receita recebidas no local `receitas`.
- `estadoVazio.ejs`: estado vazio compartilhado.
- `painelMarca.ejs`: marca das páginas públicas.

Preserve os IDs/classes e atributos `data-*` consumidos pelos scripts do navegador.
