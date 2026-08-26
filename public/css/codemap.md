# public/css/

## Responsibility

Mantém a fonte Tailwind e o resultado CSS servido pela aplicação.

## Design

- `tailwind.css` importa `tailwindcss` com `source(none)`.
- `@source "../../views"` inclui classes usadas nos templates EJS.
- `@source "../js"` inclui classes usadas pelo JavaScript.
- `style.css` contém a saída compilada do Tailwind v4.

## Flow

O script `npm run build:css` compila `public/css/tailwind.css` para `public/css/style.css`; o partial `views/partials/header.ejs` carrega o resultado em `/css/style.css`.

## Integration

- Ferramentas: `tailwindcss` e `@tailwindcss/cli` declarados em `package.json`.
- Entradas de classes: `views/` e `public/js/`.
- Consumidor HTTP: Express via `express.static('public')`.
