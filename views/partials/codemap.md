# views/partials/

## Responsibility

Componentes EJS reutilizáveis: o shell das telas (header, sidebar, topo e mensagens), o painel da marca das telas de acesso e peças compartilhadas entre telas.

## Design

- `modalLote.ejs`: modal de novo/editar lote (folha no mobile), com `editando`, `abrir` e `voltar`; `script.js` abre os modais com `data-abrir` ao carregar.
- `estadoVazio.ejs`: estado vazio estático para telas sem rota na API (recebe `icone`, `titulo`, `texto`, opcional `acao` e `compacto`).
- `header.ejs`: doctype, `lang="pt-BR"`, viewport, Google Fonts (Poppins e Roboto), Phosphor regular e fill (`/vendor/phosphor/src/regular/style.css` e `/fill/style.css`), `/css/style.css`, favicon e `<title>` (`<titulo> · MASH`, recebe `titulo`). Abre o `<body>`.
- `footer.ejs`: `#toasts`, o diálogo `#dialogoConfirmar` (substitui o `confirm()`), os moldes `tplToast`, `tplAlerta`, `tplEstado` e `tplCarregando`, `window.API_URL` (com `<` escapado) e os scripts `/js/script.js?v=6` e `/js/app.js?v=9`. Fecha `body`/`html`.
- `shellInicio.ejs` / `shellFim.ejs`: abrem e fecham o shell das telas logadas. O início inclui `header`, `sidebar`, `topBar` e `mensagens` e abre o `<main>`; recebe `titulo` e `trilha`. O fim fecha o `<main>` e inclui o `footer`.
- `cardAcessos.ejs`: card "Últimos acessos" (`#listaAcessos` + `tplLinhaAcesso`), usado em `profile.ejs` e `accessHistory.ejs`; recebe `classe`.
- `sidebar.ejs`: `<aside id="appSidebar">` com logo, `.sidebar-collapse` (desktop) e `.sidebar-close` (mobile), os `.menu-link` Receitas, Lotes, Teste de iodo, Perfil e Configuração (`data-secao` marca o item ativo; `*` vale um trecho, como `/lots/*/iodine` no Teste de iodo) e Sair (`a[href="/logout"]`), mais o `#sidebarOverlay`.
- `topBar.ejs`: header marrom com `.sidebar-open` (mobile), trilha (recebe `trilha = [seção, página]`) e link para o perfil com foto, nome e e-mail em `data-user`.
- `mensagens.ejs`: só a área `#mensagens` (alertas `danger`, `warning` e `info`; sucesso vira toast).
- `painelMarca.ejs`: painel marrom de `login` e `signup` com emblema, logo e a chamada (recebe `chamada`).

## Flow

Telas públicas (`login`, `signup`) incluem `header`, `painelMarca`, `mensagens` e `footer`. Telas logadas abrem com `shellInicio` e fecham com `shellFim`. O `public/js/app.js` preenche os `data-user` com `GET /user`, clona os moldes do `footer` e mostra as mensagens em `#mensagens` ou `#toasts`; o `public/js/script.js` controla a sidebar, os modais e o mostrar/ocultar senha. Modais e confirmação compartilham `prenderFoco()`, com fundo inativo (`inert`), Tab restrito ao diálogo e restauração do foco.

## Integration

- `shellInicio`/`shellFim`: `profile`, `accessHistory`, `settings`, `recipes`, `recipe`, `temperatureForm`, `lots`, `lot`, `analysis` e `iodineDemo`.
- `header`, `painelMarca`, `mensagens` e `footer` direto: `login` e `signup`.
- `iodineDemo` não exibe aviso de simulação (decisão de 21/10/2026, conloq/mash#9).
- IDs e classes consumidos por `public/js/script.js`: `#appSidebar`, `#sidebarOverlay`, `.sidebar-open`, `.sidebar-close`, `.sidebar-collapse`, `.menu-link`, `.js-modal`, `[data-modal-open]` e `[data-modal-close]`.
- IDs e moldes consumidos por `public/js/app.js`: `#mensagens`, `#toasts`, `#dialogoConfirmar`, `tplToast`, `tplAlerta`, `tplEstado`, `tplCarregando` e `[data-user]`.
- Recursos servidos por `index.js`: `/css/style.css`, `/js/`, `/img/` e `/vendor/phosphor`.

## Evidências

- `views/partials/*.ejs`
- `views/*.ejs` (includes)
- `public/js/script.js`, `public/js/app.js`
- `index.js`
