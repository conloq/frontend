# views/

## Responsibility

Templates EJS das telas do Sistema MASH: apresentação, navegação e formulários. O HTML sai sem dados; `public/js/app.js` busca na API e preenche (`data-user`, `#listaReceitas`, `#mensagens`). As rotas de `index.js` só chamam `res.render(<template>)`.

## Design

- `login.ejs` e `cadastro.ejs` formam o fluxo público de autenticação (formulários `#formLogin` e `#formCadastro`).
- `usuario.ejs` exibe o perfil (preenchido pelo `app.js` com `GET /user`), edita (`PUT /user`), troca a foto (`PUT /user/upload`) e exclui a conta (`DELETE /user`). O histórico de logins não existe na API e aparece como aviso.
- `receita.ejs` traz o contêiner `#listaReceitas` (preenchido pelo `app.js`) e o modal `#modalCriarProcesso` com `#formReceita`.
- `adicionarTemperatura.ejs` cria temperatura (`POST /receitas/temperatura/:id`); `editarTemperatura.ejs` é só layout (a API não tem `PUT`).
- `adicionarIodo.ejs` e `editarIodo.ejs` são só layout (a API não tem iodo).
- `index.ejs` é um arquivo de teste (`<h1>Teste</h1>`) não referenciado por nenhuma rota nem include.
- `partials/` contém o shell compartilhado.

## Flow

Toda tela inclui `partials/header.ejs` no topo e `partials/footer.ejs` no fim; as telas autenticadas incluem também `partials/sidebar.ejs` e `partials/topBar.ejs`. Os formulários (`#formLogin`, `#formCadastro`, `#formPerfil`, `#formReceita`, `#formTemperatura`) não têm `action`: o `app.js` intercepta o `submit` e chama a API. Iodo e edição de temperatura continuam só layout (sem rota na API).

## Integration

- Renderizadas pelo Express configurado em `index.js` (view engine EJS, diretório `views/`).
- Carregam `/css/style.css`, `/js/script.js` (via `footer.ejs`), Phosphor e `/img/*.png`.
- Classes Tailwind coletadas pela fonte em `public/css/tailwind.css` (`@source "../../views"`).
- IDs, classes e atributos `data-*` consumidos por `public/js/script.js`: `#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link`, `#senha`, `#btnAlterar`, `#btnSalvar`, `#inputFoto`, `#previewFoto`, `#formPerfil`, `.js-modal`, `[data-modal-open]`, `[data-modal-close]`.

## Evidências

- `views/login.ejs`
- `views/cadastro.ejs`
- `views/usuario.ejs`
- `views/receita.ejs`
- `views/adicionarTemperatura.ejs`
- `views/editarTemperatura.ejs`
- `views/adicionarIodo.ejs`
- `views/editarIodo.ejs`
- `views/index.ejs`
- `index.js`
