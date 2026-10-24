# Integrações

## API do Back-End

| Item | Contrato |
|---|---|
| Serviço | `conloq/Back-End`, REST em `API_URL` (padrão `http://localhost:8080`) |
| Leituras de página | `controllers/pageController.js` chama a API no servidor com `Authorization: Bearer <JWT>` e passa os dados a `res.render(view, locals)` |
| Login | `POST /login`; JWT retornado fica em `req.session.token` |
| Cadastro | `POST /user` do controller de página; em sucesso redireciona a `/login` |
| Escritas autenticadas | formulários POST same-origin chegam ao controller, que chama `PUT/DELETE /user`, upload, `POST /recipes`, alterações/exclusões de receita e criação de temperatura |
| Autenticação do navegador | cookie de sessão `mash.sid`, `HttpOnly`, `SameSite=Strict`, `Secure` em produção; JWT não é exposto a JavaScript |
| CORS | não necessário: browser → frontend é same-origin e frontend → API é server-side |
| Sessões | tabela `sessions` no mesmo MySQL do Back-End; migration no repo Back-End; usuário do frontend limitado a essa tabela |

## Variáveis e sessão

- `PORT`: porta do frontend (padrão `4000`).
- `API_URL`: URL da API do Back-End.
- `SESSION_SECRET`: segredo da sessão, obrigatório em `NODE_ENV=production`.
- `SESSION_DB_HOST`, `SESSION_DB_PORT`, `SESSION_DB_NAME`, `SESSION_DB_USER`, `SESSION_DB_PASSWORD`: conexão do store de sessão no MySQL existente; a porta padrão é `3306`.
- `SESSION_DB_SSL=true` ativa TLS; `SESSION_DB_SSL_CA` aceita o certificado CA em PEM para provedores com CA privada. TLS é habilitado automaticamente em produção.
- `.env` é opcional; `index.js` tenta `process.loadEnvFile()` e também aceita variáveis do ambiente.
- A tabela de sessão é criada pela migration do Back-End. O usuário MySQL do frontend precisa de `SELECT`, `INSERT`, `UPDATE` e `DELETE` somente em `sessions`; não conceda acesso às tabelas de domínio.

## Rotas de dados

| Tela | Leituras server-side |
|---|---|
| Shell autenticado | `GET /user` |
| Perfil e histórico | `GET /user/login-history`; `404` vira estado vazio |
| Receitas | `GET /recipes` e `GET /recipes/:id/temperatures` por receita |
| Receita | `GET /recipes/:id` e `GET /recipes/:id/temperatures` |
| Iodo da receita | receita e rampas |
| Temperatura | receita; ao editar também lista de rampas |
| Lote novo/edição | lista real de receitas para o seletor |

Lotes, recuperação de senha e análises não recebem dados de API que não existem no contrato implementado; as views exibem estados vazios ou formulários sem ação de backend.
