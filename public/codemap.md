# public/

## Responsibility

Fornece os recursos estáticos do navegador: CSS fonte/compilado, JavaScript, imagens e ícones usados pelas views.

## Design

- `css/tailwind.css` é a fonte Tailwind v4 e referencia `views` e `public/js` com `@source`.
- `css/style.css` é o CSS compilado e não é fonte de edição manual.
- `js/script.js` usa JavaScript vanilla e seletores DOM.
- `img/` e `icons/` contêm recursos visuais versionados.
- `uploads/` é diretório de runtime e está excluído deste mapa.

## Flow

`index.js` expõe `public/` com `express.static`. As views carregam `/css/style.css`, `/js/script.js` e imagens por URLs estáticas.

## Integration

- Servido pelo Express para `views/*.ejs`.
- CSS é gerado pelos scripts `build:css`/`watch:css` do `package.json`.
- Uploads de perfil usam o caminho configurado em `config/multer.js`.
