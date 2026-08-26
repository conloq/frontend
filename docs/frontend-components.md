# Inventário Frontend

## Escopo

Este documento registra somente a camada visual do Sistema-MASH: templates EJS, parciais, CSS/Tailwind, JavaScript do navegador e ícones. Rotas, controllers, models, banco, sessão e middleware ficam fora deste inventário.

## Shell compartilhado

| Componente | Arquivo | Responsabilidade |
|---|---|---|
| Header HTML | `views/partials/header.ejs` | Define documento HTML, idioma `pt-BR`, viewport, stylesheet Phosphor e CSS compilado. |
| Sidebar | `views/partials/sidebar.ejs` | Navegação lateral, logo MASH, recolhimento desktop e fechamento mobile. |
| Top bar | `views/partials/topBar.ejs` | Barra superior, botão mobile da sidebar e acesso visual ao perfil. |
| Footer | `views/partials/footer.ejs` | Carrega `public/js/script.js`. |
| App shell | Templates autenticados | Combina sidebar, top bar e área de conteúdo em layout responsivo. |

## Componentes de interface identificados

- **Navegação lateral:** links com ícones Phosphor, estado ativo, modo expandido/recolhido e drawer mobile.
- **Top bar:** ação de abrir menu, avatar/perfil e identificação do usuário.
- **Botão primário:** fundo `mash-orange`, texto branco, estados hover/focus.
- **Botão de ação icon-only:** ícone Phosphor, alvo mínimo de 44 px, `aria-label`, `title` e foco visível.
- **Tabela/listagem de receitas:** cabeçalho de colunas, linhas de receita, dados de temperatura e ações.
- **Modal:** overlay escuro, diálogo com título, botão de fechar e formulário.
- **Campos de formulário:** labels, inputs com borda, foco laranja e agrupamento em cards.
- **Cards de seção:** superfícies brancas com cantos arredondados e sombra leve.
- **Navegação de configuração:** abas visuais de Temperatura e Iodo nos templates de criação/edição.
- **Preview de imagem:** leitura local do arquivo escolhido antes do envio, implementada no JavaScript do navegador.

## Ícones Phosphor em uso

A fonte é carregada em `views/partials/header.ejs` a partir de `/vendor/phosphor/src/regular/style.css`.

| Uso | Classe |
|---|---|
| Marca da aplicação | `ph-flask` |
| Painel | `ph-gauge` |
| Iodo | `ph-drop` |
| Lotes | `ph-package` |
| Receitas | `ph-book-open-text` |
| Configuração | `ph-gear` |
| Recolher/expandir sidebar | `ph-caret-left` / `ph-caret-right` |
| Fechar | `ph-x` |
| Abrir menu | `ph-list` |
| Adicionar | `ph-plus` |
| Editar temperatura | `ph-pencil-simple` |
| Excluir receita | `ph-trash` |

## Comportamento JavaScript

Arquivo: `public/js/script.js`

- Persiste o estado recolhido da sidebar em `localStorage` com a chave `mash-sidebar-collapsed`.
- Atualiza `aria-expanded` e `aria-label` do controle desktop da sidebar.
- Abre e fecha o drawer mobile com overlay.
- Fecha sidebar e modais com `Escape`.
- Marca o link correspondente ao `window.location.pathname`.
- Alterna visibilidade da senha quando existe o controle correspondente.
- Atualiza preview de foto usando `FileReader`.
- Abre/fecha modais e bloqueia o scroll do `body` enquanto há modal aberto.

## Evidências

- `views/partials/header.ejs`
- `views/partials/sidebar.ejs`
- `views/partials/topBar.ejs`
- `views/partials/footer.ejs`
- `views/receita.ejs`
- `views/adicionarTemperatura.ejs`
- `views/editarTemperatura.ejs`
- `views/adicionarIodo.ejs`
- `views/editarIodo.ejs`
- `views/usuario.ejs`
- `public/js/script.js`
- `public/css/tailwind.css`
