# views/

## Responsibility

Templates EJS das telas do Sistema MASH: apresentação, navegação e formulários, no visual do redesign v2 (`docs/design/mash.pen`). As telas ligadas à API saem sem dados: `public/js/app.js` busca e preenche clonando os `<template>` das views. As rotas de `index.js` só chamam `res.render(<template>)`.

## Design

- `login.ejs` e `cadastro.ejs` formam o fluxo público de autenticação (`#formLogin`, `#formCadastro`), com o painel da marca de `partials/painelMarca.ejs`.
- `usuario.ejs` é o Perfil: dados (`#formPerfil`, `PUT /user`), foto (`#formFoto`, `PUT /user/upload`) e exclusão da conta (`#btnExcluir`, `DELETE /user`, com diálogo de confirmação).
- `recipes.ejs` lista as receitas (`#listaReceitas`, molde `tplLinhaReceita`) e cria receita no modal `#modalReceita` (`#formReceita`).
- `recipe.ejs` detalha a receita: rampas (`#detalheRampas`, molde `tplLinhaRampa`), renomear no modal `#modalRenomear` (`#formEditarReceita`) e excluir. `/recipes/:id/edit` usa a mesma tela; cada rampa tem editar e excluir (#97, `data-sem-api`).
- `temperatureForm.ejs` cria rampa (`#formTemperatura`, `POST /recipes/:id/temperatures`), com erro em cada campo. Com `editando` (rota `.../temperatures/:temperatureId/edit`), carrega a rampa e o salvar avisa `data-sem-api` (#97).
- `lots.ejs`, `lot.ejs` e `analysis.ejs` mostram lotes e análises com dados de exemplo no HTML, o aviso `partials/avisoSemApi.ejs` e ações `data-sem-api` (conloq/mash#31, #1, #3). `iodineDemo.ejs` demonstra, com dados falsos, a leitura automática do iodo que o Back-End fará com Python e OpenCV (#34): o usuário não envia foto.
- `index.ejs` é um arquivo de teste (`<h1>Teste</h1>`) não referenciado por nenhuma rota nem include.
- `partials/` contém o shell compartilhado.

## Flow

Telas públicas incluem `partials/header.ejs` e `partials/footer.ejs`. Telas autenticadas abrem com `partials/shellInicio.ejs` (header, sidebar, header marrom com trilha, `#mensagens`) e fecham com `partials/shellFim.ejs`. O `footer.ejs` traz `#toasts`, `#dialogoConfirmar` e os moldes `tplToast`, `tplAlerta`, `tplEstado` e `tplCarregando`. Os formulários não têm `action`: o `app.js` intercepta o `submit`.

## Integration

- Renderizadas pelo Express configurado em `index.js` (view engine EJS, diretório `views/`).
- Carregam Google Fonts (Poppins e Roboto), Phosphor (pesos regular e fill), `/css/style.css`, `/js/script.js` e `/js/app.js`.
- Classes Tailwind coletadas pela fonte em `public/css/tailwind.css` (`@source "../../views"`).
- IDs e atributos consumidos por `public/js/script.js`: `#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link[data-secao]`, `[data-toggle-senha]`, `#inputFoto`, `#previewFoto`, `.js-modal`, `[data-modal-open]`, `[data-modal-close]`.

## Evidências

- `views/login.ejs`, `views/cadastro.ejs`, `views/usuario.ejs`
- `views/recipes.ejs`, `views/recipe.ejs`, `views/temperatureForm.ejs`
- `views/lots.ejs`, `views/lot.ejs`, `views/iodineDemo.ejs`, `views/analysis.ejs`
- `views/partials/*.ejs`
- `index.js`
