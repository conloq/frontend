# public/js/

- `script.js`: comportamento do shell, sidebar, modais, foco acessível, controles de senha e prévia de foto.
- `app.js`: IIFE de interação e validação das telas. Dados chegam renderizados por EJS; formulários POST vão ao `pageController`, e o browser não acessa a API nem guarda o JWT.

`footer.ejs` carrega `script.js` antes de `app.js`. Preserve contratos de IDs, classes e atributos descritos em `AGENTS.md`.
