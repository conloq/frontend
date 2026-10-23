# views/

## Responsibility

Templates EJS das telas do Sistema MASH: apresentação, navegação e formulários, no visual do redesign v2 (`docs/design/mash.pen`). As telas ligadas à API saem sem dados: `public/js/app.js` busca e preenche clonando os `<template>` das views. As rotas de `index.js` só chamam `res.render(<template>)`.

## Design

- `login.ejs` e `signup.ejs` formam o fluxo público de autenticação (`#formLogin`, `#formCadastro`), com o painel da marca de `partials/painelMarca.ejs`.
- `profile.ejs` é o Perfil: dados (`#formPerfil`, `PUT /user`), foto (`#formFoto`, `PUT /user/upload`) exclusão da conta (`#btnExcluir`, `DELETE /user`, com diálogo de confirmação) e o card "Últimos acessos" (`partials/cardAcessos.ejs`: `#listaAcessos`, linhas de `tplLinhaAcesso`, preenchido com `GET /user/login-history`); no mobile o card vira uma linha que abre `/profile/access-history`.
- `accessHistory.ejs` é a tela mobile de últimos acessos (`/profile/access-history`), com o mesmo `cardAcessos.ejs`.
- `settings.ejs` é a Configuração, com abas (na lateral a partir de `lg`, no topo no mobile) Acessibilidade (`/settings`) e Segurança (`/settings/security`), escolhidas pelo local `aba`. O `#formConfiguracao` usa `data-sem-api`: a API ainda não guarda preferências.
- `recipes.ejs` lista as receitas (`#listaReceitas`, molde `tplLinhaReceita`) e cria receita no modal `#modalReceita` (`#formReceita`).
- `recipe.ejs` detalha a receita: rampas (`#detalheRampas`, molde `tplLinhaRampa`), perfil das rampas (`#perfilRampas`/`#perfilGrafico`, molde `tplFaixaRampa`, desenhado com o início e a duração do timer de cada rampa), renomear no modal `#modalRenomear` (`#formEditarReceita`) e excluir. `/recipes/:id/edit` usa a mesma tela com `#modalRenomear` aberto (`data-abrir`, volta para `/recipes/:id` ao fechar); cada rampa tem editar e excluir (#97, `data-sem-api`).
- `recipeIodine.ejs` é o teste de iodo da receita (`#formIodoReceita`): rampa (de `GET /recipes/:id/temperatures`), primeira coleta, intervalo e máximo de coletas; salvar é `data-sem-api` (#101) e a prévia (`#previaCapturas`, molde `tplCapturaPrevia`) é desenhada com os valores digitados.
- `temperatureForm.ejs` cria rampa (`#formTemperatura`, `POST /recipes/:id/temperatures`), com erro em cada campo. Com `editando` (rota `.../temperatures/:temperatureId/edit`), carrega a rampa; o salvar tem `data-sem-api` e não envia nada, sem aviso (#97).
- Telas sem rota na API, em estado vazio e honesto (partial `estadoVazio.ejs`, sem registros fictícios): `dashboard.ejs`, `lots.ejs`, `lot.ejs` (excluir `data-sem-api`), novo e editar lote no modal `partials/modalLote.ejs` (`#modalLote`/`#formLote`, `editando`; o seletor `#loteReceita` vem de `GET /recipes`; `/lots/new` e `/lots/:id/edit` abrem a tela com o modal aberto), `lotMonitoring.ejs`, `iodineSession.ejs` (`etapa` preparar/leitura; câmera desconectada, calibração pendente, configuração da sessão com "—" e escala; a leitura tem "Encerrar leitura" e "Tentar reconectar") e `forgotPassword.ejs` (`#formRecuperar`, `etapa` email/codigo/redefinir, páginas públicas; código em 6 caixas `[data-codigo]` e botão `[data-reenviar]`). `analysis.ejs` mostra indisponibilidade. `iodineDemo.ejs` é a simulação do teste de iodo em `/analyses/new`, com coletas locais, sem persistência e sem etiqueta de simulação na tela (decisão de 21/10/2026, conloq/mash#9).
- `partials/` contém o shell compartilhado.

## Flow

Telas públicas incluem `partials/header.ejs` e `partials/footer.ejs`. Telas autenticadas abrem com `partials/shellInicio.ejs` (header, sidebar, header marrom com trilha, `#mensagens`) e fecham com `partials/shellFim.ejs`. O `footer.ejs` traz `#toasts`, `#dialogoConfirmar` e os moldes `tplToast`, `tplAlerta`, `tplEstado` e `tplCarregando`. O `app.js` intercepta o `submit`; formulários com senha usam `method="post"` para que falhas de JavaScript não coloquem credenciais na URL.

## Integration

- Renderizadas pelo Express configurado em `index.js` (view engine EJS, diretório `views/`).
- Carregam Google Fonts (Poppins e Roboto), Phosphor (pesos regular e fill), `/css/style.css`, `/js/script.js` e `/js/app.js`.
- Classes Tailwind coletadas pela fonte em `public/css/tailwind.css` (`@source "../../views"`).
- IDs e atributos consumidos por `public/js/script.js`: `#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link[data-secao]`, `[data-toggle-senha]`, `[data-codigo]`, `[data-reenviar]`, `#inputFoto`, `#previewFoto`, `.js-modal`, `[data-modal-open]`, `[data-modal-close]`.

## Evidências

- `views/login.ejs`, `views/signup.ejs`, `views/profile.ejs`
- `views/recipes.ejs`, `views/recipe.ejs`, `views/temperatureForm.ejs`
- `views/dashboard.ejs`, `views/lots.ejs`, `views/lot.ejs`, `views/lotMonitoring.ejs`, `views/iodineSession.ejs`, `views/iodineDemo.ejs`, `views/analysis.ejs`, `views/forgotPassword.ejs`
- `views/partials/*.ejs`
- `index.js`
