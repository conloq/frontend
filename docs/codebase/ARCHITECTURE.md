# Architecture

## 1. Visão geral

O sistema é um monólito web server-rendered: Express recebe a requisição, middleware consulta a sessão, controller executa regras e operações Sequelize, e EJS produz a resposta HTML. Não há SPA, camada de API separada, repository layer ou domain layer identificados.

## 2. Fluxo de inicialização

`index.js`:

1. importa Express, configuração de banco, modelos/associações, routers e sessão;
2. autentica no MySQL e solicita a criação do banco `cervejaria`;
3. inicia sincronização dos modelos com `force: false`;
4. configura EJS, arquivos estáticos, parsers e sessão;
5. monta os três routers na raiz;
6. escuta na porta `8080`.

A ordem é iniciada por chamadas assíncronas que não são todas aguardadas antes do `listen`.

## 3. Fluxo de requisição

```text
HTTP request
  → route
  → middleware opcional
  → controller
  → Sequelize model/association
  → redirect ou render EJS
  → HTML + public assets
```

## 4. Fluxos de negócio observados

### Autenticação

- `GET /` usa `isGuest` e renderiza `login.ejs`.
- `POST /login` busca `Usuario`, compara bcrypt, grava campos na sessão, registra `LogConexao` e redireciona para `/usuario`.
- `GET /cadastro` usa `isGuest`.
- `POST /cadastrar` gera hash e cria `Usuario`.

### Usuário

`GET /usuario` usa `isLogado` e `infoGlobal`, busca usuário/logins e renderiza `usuario.ejs`. Atualização, foto, exclusão e logout dependem dos campos de sessão definidos no login.

### Receita

`GET /receita` filtra `Receita` por `req.session.userId` e inclui temperaturas ativas pelo alias `temperaturas`. Criação, exclusão, edição de temperaturas e configuração de iodo ficam em `receitaController.js`.

### Temperatura

A criação conta temperaturas existentes e marca a primeira como ativa. A seleção de uma temperatura desativa as demais e ativa a escolhida em duas atualizações independentes.

O formulário `views/editarTemperatura.ejs` envia `limiteMaximoTemperatura`; `updateTemperatura` agora lê o mesmo nome e grava `temp_maxima_limite`.

## 5. Entidades e associações

- `Usuario hasMany Receita`.
- `Receita belongsTo Usuario`.
- `Receita hasMany Temperatura`.
- `Temperatura belongsTo Receita`.
- `Receita hasMany Iodo`.
- `Iodo belongsTo Receita`.
- `Usuario hasMany LogConexao`.
- `LogConexao belongsTo Usuario`.

As associações estão centralizadas em `config/associations.js`, mas FKs também aparecem nos modelos.

## 6. Padrões e acoplamentos

- [TODO] A ordem efetiva de prontidão do banco, sincronização dos modelos, sincronização da sessão e abertura do servidor não está registrada além das chamadas observadas em `index.js`.

- Controllers acessam Sequelize diretamente.
- A sessão é exposta às views como `res.locals.usuario`.
- Views dependem dos nomes dos campos da sessão e dos nomes dos formulários.
- O alias `temperaturas` conecta associação, controller e `views/receita.ejs`.
- Não foi encontrado mecanismo de injeção de dependências, fila, worker ou event bus.

## 7. Evidências existentes

- `index.js`
- `routes/route.js`
- `routes/usuarioRoutes.js`
- `routes/receitaRoutes.js`
- `middleware/guestMiddleware.js`
- `middleware/globalInfoUserMiddleware.js`
- `controller/loginController.js`
- `controller/receitaController.js`
- `config/associations.js`
- `views/editarTemperatura.ejs`
- `docs/codebase/.codebase-scan.txt` (scan preservado)

## Evidências

- `index.js`
- `routes/route.js`
- `routes/usuarioRoutes.js`
- `routes/receitaRoutes.js`
- `controller/loginController.js`
- `controller/receitaController.js`
- `config/associations.js`
- `middleware/guestMiddleware.js`
- `middleware/globalInfoUserMiddleware.js`
- `views/editarTemperatura.ejs`
