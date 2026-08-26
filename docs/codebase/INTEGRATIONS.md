# Integrations

## 1. Banco de dados

- Banco: MySQL via `mysql2` e Sequelize.
- Conexão definida em `config/sequelize-config.js`.
- Banco configurado: `cervejaria`.
- `config/data-base.js` autentica a conexão e executa criação do banco caso não exista.
- `index.js` sincroniza os modelos com `force: false`.
- Migrações versionadas: [TODO] não foi encontrada configuração de migrations.

## 2. Sessões e autenticação

- `express-session` fornece a sessão HTTP.
- `connect-session-sequelize` persiste sessões usando Sequelize.
- `config/session.js` configura `resave: false`, `saveUninitialized: false`, cookie HTTP-only e duração de sete dias.
- `middleware/guestMiddleware.js` implementa `isGuest` e `isLogado`.
- `middleware/globalInfoUserMiddleware.js` coloca `req.session` em `res.locals.usuario`.
- O login grava `userId`, `userEmail`, `nome` e `url_imagem` na sessão.
- Secret de sessão: hardcoded em `config/session.js`; fonte externa de segredo: [TODO].

## 3. API externa

`controller/loginController.js` chama:

```text
http://ip-api.com/json/{ip}
```

A resposta é usada para preencher `LogConexao.localidade`. A falha dessa integração é capturada em bloco separado e o login pode prosseguir.

## 4. Uploads e arquivos estáticos

- `config/multer.js` usa armazenamento em disco em `public/uploads`.
- Extensões permitidas no backend: JPEG, JPG e PNG.
- Limite configurado: 20 MB.
- O nome salvo usa o nome original do arquivo.
- `index.js` serve `public/` como conteúdo estático.
- Phosphor é exposto em `/vendor/phosphor`.

## 5. Observabilidade e mensageria

- Logging observado: `console.log`/`console.error`.
- APM, métricas, tracing, filas e event bus: [TODO] não foram encontrados no scan.
- Gateway, service mesh ou proxy: [TODO] não configurado no repositório.

## 6. Credenciais e configuração

- Não foram encontrados `.env.example`, `.env.template` ou equivalente no scan.
- Credenciais MySQL e segredo de sessão estão no código de configuração atual.
- [ASK USER] Definir se a configuração deve permanecer local/hardcoded ou migrar para variáveis de ambiente é uma decisão de intenção operacional.

## 7. Evidências existentes

- `config/sequelize-config.js`
- `config/data-base.js`
- `config/session.js`
- `config/multer.js`
- `controller/loginController.js`
- `index.js`
- `package.json`
- `docs/codebase/.codebase-scan.txt` (scan preservado)

## Evidências

- `config/sequelize-config.js`
- `config/data-base.js`
- `config/session.js`
- `config/multer.js`
- `controller/loginController.js`
- `index.js`
- `package.json`
