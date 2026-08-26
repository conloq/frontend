# Repository Atlas: Sistema-MASH

## Project Responsibility

Aplicação web Node.js/Express para cadastro e acompanhamento de receitas de produção de cerveja, incluindo parâmetros de temperatura e testes de iodo, com autenticação por sessão e persistência MySQL via Sequelize.

## System Entry Points

- `index.js`: cria a aplicação Express, configura EJS e arquivos estáticos, inicializa banco/modelos, instala sessão e monta os routers na raiz.
- `package.json`: define o runtime ES module, dependências e scripts `start`, `build:css` e `watch:css`.
- `routes/route.js`: entrada HTTP para login e cadastro.
- `routes/usuarioRoutes.js`: entrada HTTP para perfil e sessão do usuário.
- `routes/receitaRoutes.js`: entrada HTTP para receitas, temperaturas e iodo.

## Repository Directory Map

| Directory | Responsibility Summary | Detailed Map |
|---|---|---|
| `config/` | Conexão MySQL/Sequelize, sessão, upload e associações entre models. | [config/codemap.md](config/codemap.md) |
| `controller/` | Handlers HTTP de autenticação, cadastro, usuário, receitas, temperaturas e iodo. | [controller/codemap.md](controller/codemap.md) |
| `middleware/` | Guards de sessão e exposição de dados da sessão aos templates. | [middleware/codemap.md](middleware/codemap.md) |
| `models/` | Definições Sequelize de usuário, receita, temperatura, iodo e histórico de login. | [models/codemap.md](models/codemap.md) |
| `routes/` | Routers Express e associação entre endpoints, middleware e controllers. | [routes/codemap.md](routes/codemap.md) |
| `services/` | Hash e comparação de senhas com bcrypt. | [services/codemap.md](services/codemap.md) |
| `views/` | Templates EJS das telas públicas e autenticadas. | [views/codemap.md](views/codemap.md) |
| `views/partials/` | Shell compartilhado: header, footer, sidebar e top bar. | [views/partials/codemap.md](views/partials/codemap.md) |
| `public/` | Recursos estáticos do navegador, excluindo uploads deste mapa. | [public/codemap.md](public/codemap.md) |
| `public/css/` | Fonte Tailwind e CSS compilado servido pela aplicação. | [public/css/codemap.md](public/css/codemap.md) |
| `public/js/` | Interações vanilla JS da sidebar, modais, formulários e preview de imagem. | [public/js/codemap.md](public/js/codemap.md) |

## Runtime Flow

1. `index.js` configura Express, EJS, `express.static('public')`, sessão e parsers de formulário/JSON.
2. Os três routers são montados em `/`.
3. Middleware de sessão decide acesso quando aplicado.
4. Controllers leem requisição/sessão, acessam models Sequelize e renderizam views ou redirecionam.
5. Views EJS incluem partials, carregam o CSS compilado e o JavaScript do navegador.
6. Models compartilham a conexão de `config/sequelize-config.js`; associações são registradas em `config/associations.js`.

## Cross-Module Integration

- **Autenticação:** `routes/route.js` → `loginController.js`/`cadastroController.js` → `services/bcrypt.js` → `Usuario` → sessão Sequelize.
- **Perfil:** `usuarioRoutes.js` → `UsuarioController.js` → `Usuario`/`LogConexao` → `views/usuario.ejs`.
- **Receitas:** `receitaRoutes.js` → `receitaController.js` → `Receita`, `Temperatura` e `Iodo` → views específicas.
- **Frontend:** `views/partials/header.ejs` carrega `public/css/style.css`; templates e `public/js/script.js` são fontes para a compilação Tailwind.
- **Uploads:** formulário de `views/usuario.ejs` → Multer em `config/multer.js` → `public/uploads`.

## Scope Exclusions

Este atlas documenta somente código e configuração verificáveis. Foram excluídos `node_modules/`, `docs/`, `public/uploads/`, CSS compilado e demais artefatos gerados como fontes de arquitetura.
