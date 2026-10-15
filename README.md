# Sistema MASH

Frontend EJS do Sistema MASH: telas de login, cadastro, perfil, receitas, temperaturas e testes de iodo.

Este repositório tem **somente as telas**. A regra de negócio, o banco e o JWT ficam na API (`conloq/Back-End`, porta 8080). O `index.js` só entrega as páginas; quem consome a API é o navegador, em `public/js/app.js`.

## Execução

```bash
npm install
npm run build:css
npm start
```

O frontend sobe na **4000** e a API na **8080**, portas diferentes, nunca as mesmas. As duas precisam estar de pé:

```bash
# na API
npm start

# aqui
npm start
```

Acesse `http://localhost:4000`. A URL da API vem de `API_URL` (padrão `http://localhost:8080`); copie `.env.example` para `.env` para trocar.

## Como funciona

- `index.js` (Express 5 + EJS) registra uma rota `GET` por tela, serve `public/` e `/vendor/phosphor`, e publica `API_URL` para o navegador como `window.API_URL`.
- `public/js/app.js` é o cliente: faz login, guarda o token em `localStorage` (`mash-token`), envia `Authorization: Bearer` e exibe as mensagens da API em pt-BR como vieram.
- `public/js/script.js` cuida do shell (sidebar, modais, mostrar/ocultar senha, prévia da foto).
- Sem token, as telas internas redirecionam para `/login`; com `401`, o token é descartado e o usuário volta ao login.
- O Back-End libera CORS para `http://localhost:4000` (`FRONTEND_URL`).

## Rotas do frontend

| Rota GET | Tela |
|---|---|
| `/` | redireciona para `/receitas` |
| `/login` | `views/login.ejs` |
| `/cadastro` | `views/cadastro.ejs` |
| `/logout` | redireciona para `/login` (o cliente limpa o token) |
| `/usuario` | `views/usuario.ejs` |
| `/receitas` | `views/receita.ejs` |
| `/receitas/temperatura/cadastrar/:id` | `views/adicionarTemperatura.ejs` |
| `/receitas/temperatura/editar/:id` | `views/editarTemperatura.ejs` |
| `/receitas/iodo/cadastrar/:id` | `views/adicionarIodo.ejs` |
| `/receitas/iodo/editar/:id` | `views/editarIodo.ejs` |

## Rotas da API usadas pelo navegador

| Tela | Chamadas |
|---|---|
| Login | `POST /login` |
| Cadastro | `POST /user` |
| Perfil | `GET /user`, `PUT /user`, `PUT /user/upload`, `DELETE /user` |
| Receitas | `GET /receitas`, `POST /receitas`, `DELETE /receitas/:recipeId` |
| Temperatura | `GET /receitas/temperatura/:id`, `POST /receitas/temperatura/:id` |

Iodo e edição de temperatura ainda não têm rota na API: essas telas são só layout (`conloq/mash#73`).

> **Mudança prevista:** com a conloq/mash#71 e a conloq/mash#32, a API passa a usar `/recipes` e `/recipes/:id/temperatures`, e os campos passam a camelCase (`minTemperatureRamp`, `idealTime`, `phone`, `urlImage`; decisão de 08/10/2026). A troca no `public/js/app.js` e nos formulários é a conloq/mash#86, que atualiza esta tabela no mesmo Pull Request. Alterar e excluir receita via API são a conloq/mash#93.

## Documentação

- `codemap.md`: atlas do repositório e mapas por diretório.
- `AGENTS.md`: regras de trabalho no repositório.
- `docs/codebase/`: stack, estrutura, arquitetura, convenções, integrações, testes e riscos.
- `docs/frontend-screens.md` e `docs/frontend-components.md`: inventário de telas e componentes.
