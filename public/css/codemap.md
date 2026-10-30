# public/css/

## Responsibility

Mantém a fonte Tailwind e o resultado CSS servido pela aplicação.

## Design

- `tailwind.css` importa `tailwindcss` com `source(none)` e `@source "../../src"`, para incluir as classes dos componentes e páginas React.
- `style.css` contém a saída compilada do Tailwind v4.
- `@theme` define os tokens do redesign v2 (fonte visual: `docs/design/mash.pen`):
  - fontes: `--font-sans` (Roboto, interface) e `--font-display` (Poppins, títulos);
  - marca: `--color-mash-brown`, `--color-mash-brown-dark` e `--color-mash-orange`;
  - ação e foco: `--color-action`, `-hover`, `-pressionado`, `-suave` e `--color-focus`;
  - superfícies e texto: `--color-background`, `--color-surface`, `--color-border`, `--color-foreground`, `--color-muted-foreground`, `--color-header-muted-foreground`, `--color-hover-neutral`, `--color-disabled` e `--color-disabled-foreground`;
  - estados, cada um com a versão `-suave`: `--color-success`, `--color-warning`, `--color-danger` e `--color-info`.
- `@utility btn` e `@utility badge` são as bases que os componentes reutilizam com `@apply`.
- `@layer components` define as classes que as telas usam em vez de estilos avulsos: `btn-primary`, `btn-secondary`, `btn-danger`, `btn-back` (links de voltar), `actions` (grupo de botões: duas colunas no mobile), `btn-ghost`, `btn-icon`, `btn-icon-danger`; `switch`, `segmented`, `slider` (controles da Configuração); `field`, `field-label`, `field-box`, `field-unit`, `field-help`, `field-error`; `card`; `list-header`, `list-row`; `badge-success`, `badge-warning`, `badge-danger`, `badge-info`; `skeleton`; `sheet` (modal que sobe de baixo no mobile); `mobile-bar`; e as do shell (`app-shell-content`, `menu-link-active`, estados da sidebar por `data-sidebar-state` e `body.sidebar-collapsed`).

## Flow

`npm run build:css` compila `tailwind.css` para `style.css`. O `style.css` é versionado: rode o build e commite o resultado sempre que mudar classes em `src/` ou no `tailwind.css`.

## Integration

- Ferramentas: `tailwindcss` e `@tailwindcss/cli` em `package.json`.
- Entrada de classes: `src/`.
- Formatação: o Prettier formata o `tailwind.css` (2 espaços, aspas duplas) e ignora o `style.css` gerado (`.prettierignore`).
