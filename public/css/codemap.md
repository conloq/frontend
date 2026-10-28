# public/css/

## Responsibility

Mantém a fonte Tailwind e o resultado CSS servido pela aplicação.

## Design

- `tailwind.css` importa `tailwindcss` com `source(none)` e `@source "../../src"`, para incluir as classes dos componentes e páginas React.
- `style.css` contém a saída compilada do Tailwind v4.
- `@theme` define os tokens do redesign v2 (fonte visual: `docs/design/mash.pen`):
  - fontes: `--font-sans` (Roboto, interface) e `--font-display` (Poppins, títulos);
  - marca: `--color-mash-brown`, `--color-mash-brown-dark` e `--color-mash-orange`;
  - ação e foco: `--color-acao`, `-hover`, `-pressionado`, `-suave` e `--color-foco`;
  - superfícies e texto: `--color-fundo`, `--color-superficie`, `--color-linha`, `--color-texto`, `--color-texto-2`, `--color-header-texto-2`, `--color-hover-neutro`, `--color-desativado` e `--color-texto-desativado`;
  - estados, cada um com a versão `-suave`: `--color-sucesso`, `--color-aviso`, `--color-perigo` e `--color-info`.
- `@utility btn` e `@utility selo` são as bases que os componentes reutilizam com `@apply`.
- `@layer components` define as classes que as telas usam em vez de estilos avulsos: `btn-primario`, `btn-secundario`, `btn-perigo`, `btn-voltar` (links de voltar), `acoes` (grupo de botões: duas colunas no mobile), `btn-fantasma`, `btn-icone`, `btn-icone-perigo`; `interruptor`, `segmentado`, `deslizante` (controles da Configuração); `campo`, `campo-rotulo`, `campo-caixa`, `campo-unidade`, `campo-ajuda`, `campo-erro`; `card`; `tabela-cabecalho`, `tabela-linha`; `selo-sucesso`, `selo-aviso`, `selo-perigo`, `selo-info`; `esqueleto`; `folha` (modal que sobe de baixo no mobile); `barra-mobile`; e as do shell (`app-shell-content`, `menu-link-active`, estados da sidebar por `data-sidebar-state` e `body.sidebar-collapsed`).

## Flow

`npm run build:css` compila `tailwind.css` para `style.css`. O `style.css` é versionado: rode o build e commite o resultado sempre que mudar classes em `src/` ou no `tailwind.css`.

## Integration

- Ferramentas: `tailwindcss` e `@tailwindcss/cli` em `package.json`.
- Entrada de classes: `src/`.
- Formatação: o Prettier formata o `tailwind.css` (2 espaços, aspas duplas) e ignora o `style.css` gerado (`.prettierignore`).
