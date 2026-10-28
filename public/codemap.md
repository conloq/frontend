# public/

## Responsibility

Recursos estáticos que o Next serve na raiz do site: o CSS do Tailwind (fonte e gerado) e as imagens.

## Design

- `css/tailwind.css` é a fonte Tailwind v4 e lê as classes de `src/` com `@source`.
- `css/style.css` é o CSS compilado, carregado por `src/pages/_document.js`; não se edita à mão.
- `img/` contém `foto-perfil.png` (avatar padrão no top bar e no perfil), `logo-mash.png` e `mash-emblema.png` (marca da sidebar e das telas de acesso), `espuma.png` (fundo da recuperação de senha no desktop) e `mash.png` (favicon antigo, sem uso nas telas).
- Os ícones vêm da fonte Phosphor, importada em `src/pages/_app.js`.

## Integration

- `css/style.css` é gerado por `npm run build:css` (também dentro de `npm run build`).
- Nenhuma tela grava arquivos em `public/`; a foto de perfil vai para a API (Cloudinary).
