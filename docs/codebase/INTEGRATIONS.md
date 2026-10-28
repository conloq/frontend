# Integrações

## API do Back-End

| Item | Contrato |
|---|---|
| Serviço | `conloq/Back-End`, REST em `NEXT_PUBLIC_API_URL` (padrão `http://localhost:8080`) |
| Cliente | `axios.create` em `src/services/api.js`, timeout de 15 s |
| Login | `POST /login`; o JWT retornado fica no `localStorage` (`mash_token`) |
| Cadastro | `POST /user`; em sucesso vai para `/login` com mensagem |
| Autenticação | interceptor envia `Authorization: Bearer <JWT>`; `401` (fora do login) apaga o token e vai para `/login` |
| Logout | sem rota na API; só apaga o token |
| CORS | obrigatório: o Back-End libera `FRONTEND_URL` com `Content-Type` e `Authorization` |
| Banco | nenhum acesso; o frontend não conecta ao MySQL |

## Variáveis

- `NEXT_PUBLIC_API_URL`: URL da API. Entra no build e chega ao navegador; não colocar segredos em `NEXT_PUBLIC_*`.
- `.env` é opcional; `.env.example` documenta a variável.

## Rotas de dados

| Tela | Chamadas |
|---|---|
| Shell autenticado | `GET /user` |
| Perfil | `PUT /user`, `PUT /user/upload` (multipart, campo `image`), `DELETE /user` |
| Perfil e histórico | `GET /user/login-history`; `404` vira lista vazia (conloq/mash#102) |
| Receitas | `GET /recipes`, `POST /recipes`, `DELETE /recipes/:id` e `GET /recipes/:id/temperatures` por receita |
| Receita | `GET`, `PUT` e `DELETE /recipes/:id`, `GET /recipes/:id/temperatures` |
| Iodo da receita | receita e rampas (salvar sem rota, conloq/mash#101) |
| Nova rampa | receita e `POST /recipes/:id/temperatures` |
| Editar rampa | receita e rampas (salvar e excluir sem rota, conloq/mash#97) |
| Lote novo/edição | `GET /recipes` para o seletor |

Lotes, recuperação de senha e análises não chamam rotas que não existem; as telas mostram estados vazios ou formulários que só bloqueiam o envio.
