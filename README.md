# Sistema MASH

Frontend EJS do Sistema MASH. O Back-End (`conloq/Back-End`, porta 8080) mantém as regras, os dados de domínio e emite o JWT; este repositório mantém as telas, a camada de apresentação e a sessão web. Os repositórios seguem separados.

## Fluxo das páginas

`index.js` configura Express, EJS e sessão, e monta `controllers/pageController.js`. Nas páginas autenticadas, o controller envia o JWT da sessão à API, recebe os dados e chama `res.render('profile', { user })`, por exemplo. A view imprime com EJS (`<%= user.name %>`), escapando o conteúdo.

O navegador recebe um cookie de sessão `HttpOnly`; o JWT fica no servidor, persistido na tabela `sessions` do MySQL existente. A migration dessa tabela fica no Back-End; a conta do frontend acessa somente essa tabela. Os formulários enviam POST ao `pageController`, que chama as rotas da API e redireciona para a página EJS. O JavaScript fica com interações do navegador. Configure `SESSION_DB_*`, `API_URL` e `SESSION_SECRET` no `.env`; em produção, a conexão com MySQL usa TLS (`SESSION_DB_SSL_CA` para uma CA privada).

## Executar

```bash
npm install
npm run build:css
npm start
```

O frontend roda em `http://localhost:4000`. Primeiro aplique a migration do Back-End; depois configure no frontend uma conta MySQL com acesso somente a `sessions`. A API precisa estar disponível em `API_URL` para login e páginas que exibem dados reais. Copie `.env.example` para `.env` e configure as credenciais locais.

## Deploy publicado

| Serviço | URL |
|---|---|
| Frontend | <https://frontend-a6u4.onrender.com> |
| API do Back-End | <https://back-end-xxq5.onrender.com> |

No serviço do frontend no Render, `API_URL` aponta para `https://back-end-xxq5.onrender.com`. Build Command: `npm install --include=dev && npm run build:css`. Start Command: `npm start`. Não versionar os valores de `SESSION_DB_*` nem `SESSION_SECRET`.

Para voltar a uma versão anterior da aplicação, use **Rollback** no histórico de deploys do serviço no Render. Isso não desfaz migrations do banco; alterações de schema exigem avaliação e procedimento próprios no Back-End.

## Verificações

`npm test` verifica sintaxe, contrato EJS do perfil, upload e regressões do cliente. Não requer API nem banco. `npm run format:check` verifica os arquivos formatados pelo Prettier.

## Telas

As rotas de página estão em `controllers/pageController.js`. Login, cadastro, perfil, histórico de acessos, receitas e rampas recebem dados do backend antes de renderizar. Dashboard, lotes, recuperação de senha e análise detalhada mantêm estados vazios quando a API ainda não oferece esses dados. `/dw2-example` é um exemplo didático isolado de `res.render` com dados EJS.

Consulte `codemap.md`, `AGENTS.md` e `docs/codebase/` para os mapas e convenções do projeto.
