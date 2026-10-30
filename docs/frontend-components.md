# Inventário Frontend

## Escopo

Este documento registra a camada visual do Sistema MASH: componentes React em `src/components/`, Tailwind CSS e ícones. As chamadas à API estão em `docs/codebase/INTEGRATIONS.md`.

## Shell compartilhado

| Componente | Arquivo | Responsabilidade |
|---|---|---|
| Documento | `src/pages/_document.js` | `lang="pt-BR"`, Google Fonts, `/css/style.css`, favicon e o script que aplica `body.sidebar-collapsed` antes da primeira pintura. |
| Ícones | `src/pages/_app.js` | Importa `@phosphor-icons/web/regular` e `/fill`. |
| App shell | `src/components/AppShell` | Sidebar (`#appSidebar`, recolhível no desktop, gaveta no mobile com `#sidebarOverlay`), top bar com trilha, voltar no mobile e avatar, área `#mensagens` e guarda de sessão. |
| Telas de acesso | `src/components/AuthLayout` | Painel marrom da marca no desktop, faixa da marca no mobile, título e `#mensagens`. |

## Componentes compartilhados (`src/components/Feedback`)

- **`Messages` e `flash(tipo, texto)`:** alerta de sucesso ou erro em `#mensagens`, que sobrevive a uma navegação.
- **`EmptyState`:** ícone, título, texto e ação opcional; versão `compact`.
- **`Modal` e `ModalActions`:** diálogo com título, fechar, Escape, foco preso e retorno do foco; vira folha que sobe de baixo no mobile (`folha`).
- **`ConfirmDialog`:** confirmação de ações destrutivas (`#dialogoConfirmar`), no lugar do `window.confirm`.
- **`Field`:** campo do design system (`campo`, `campo-rotulo`, `campo-caixa`, `campo-ajuda`, `campo-unidade`), com erro em `.campo-erro`.
- **`PasswordInput`:** senha com botão mostrar/ocultar (`data-toggle-senha`).
- **`ServerError`:** falha ao carregar a página, com link para o painel.

## Componentes de tela identificados

- **Navegação lateral:** links com ícones Phosphor, item ativo pelo prefixo mais específico da URL, estado recolhido persistido em `mash-sidebar-collapsed`.
- **Tabelas:** receitas e rampas com `tabela-cabecalho`/`tabela-linha`; no mobile cada linha vira card.
- **Perfil das rampas:** gráfico em blocos posicionados por início e duração do timer, com faixa da rampa e limites.
- **Prévia da sessão de iodo:** trilho com calibração e capturas a partir da primeira coleta.
- **Configuração:** abas laterais (topo no mobile), `interruptor`, `segmentado` e `deslizante`.
- **Código de 6 dígitos:** caixas que avançam ao digitar, voltam no Backspace e aceitam colar.
- **Simulação do teste de iodo:** amostra que muda de cor, escala de amido e lista de coletas.

## Ícones Phosphor em uso (menu)

| Uso | Classe |
|---|---|
| Painel | `ph-squares-four` |
| Receitas | `ph-scroll` |
| Lotes | `ph-cube` |
| Teste de iodo | `ph-test-tube` |
| Perfil | `ph-user-circle` |
| Configuração | `ph-gear` |
| Sair | `ph-sign-out` |
| Recolher/expandir sidebar | `ph-caret-double-left` / `ph-caret-double-right` |
| Abrir menu, fechar | `ph-list`, `ph-x` |

## Evidências

- `src/components/AppShell/index.js`
- `src/components/AuthLayout/index.js`
- `src/components/Feedback/index.js`
- `src/components/RecipeContent/index.js`
- `src/pages/_document.js`, `src/pages/_app.js`
- `public/css/tailwind.css`
