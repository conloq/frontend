# public/

## Responsibility

Fornece os recursos estáticos do navegador servidos por `index.js`: CSS fonte e compilado, JavaScript, imagens e ícones.

## Design

- `css/tailwind.css` é a fonte Tailwind v4 e referencia `views` e `public/js` com `@source`.
- `css/style.css` é o CSS compilado e não é fonte de edição manual.
- `js/script.js` usa JavaScript vanilla com helpers `$`/`$$`; `js/app.js` consome a API do Back-End.
- `img/` contém `mash.png` (usada em `login.ejs` e `signup.ejs`), `foto-perfil.png` (usada em `profile.ejs` e `topBar.ejs`), `logo-mash.png` e `mash-emblema.png` (marca das telas de acesso) e `espuma.png` (fundo de `forgotPassword.ejs`, vinda de `docs/design/mash-assets`).
- `icons/` reúne PNGs de apoio que **nenhum template referencia** hoje; os ícones de interface vêm da fonte Phosphor.

## Flow

`index.js` expõe `public/` com `express.static`. As views carregam `/css/style.css`, `/js/script.js` e `/img/*.png` por URLs estáticas.

## Integration

- Servido pelo Express para `views/*.ejs`.
- `css/style.css` é gerado pelos scripts `build:css`/`watch:css` do `package.json`.
- Nenhuma rota grava arquivos em `public/`; a foto de perfil vai para a API (Cloudinary).

## Evidências

- `public/css/tailwind.css`
- `public/css/style.css`
- `public/js/script.js`
- `public/img/`
- `public/icons/`
- `index.js`
