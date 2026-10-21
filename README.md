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

Cada rota é um `GET` em `index.js` que só renderiza a tela; os dados vêm da API pelo navegador.

| Rota GET | Tela |
|---|---|
| `/` | redireciona para `/recipes` |
| `/login` | `views/login.ejs` |
| `/cadastro` | `views/cadastro.ejs` |
| `/logout` | redireciona para `/login` (o cliente limpa o token) |
| `/usuario` | `views/usuario.ejs` (perfil) |
| `/recipes` | `views/recipes.ejs` |
| `/recipes/:id`, `/recipes/:id/edit` | `views/recipe.ejs` (mesma tela: renomear e editar/excluir rampas) |
| `/recipes/:id/temperatures/new` | `views/temperatureForm.ejs` (nova rampa) |
| `/recipes/:id/temperatures/:temperatureId/edit` | `views/temperatureForm.ejs` (editar rampa) |
| `/lots` | `views/lots.ejs` |
| `/lots/:id` | `views/lot.ejs` |
| `/analyses/new` | `views/iodineDemo.ejs` (demonstração do teste de iodo) |
| `/analyses/:id` | `views/analysis.ejs` |

## Rotas da API usadas pelo navegador

| Tela | Chamadas |
|---|---|
| Login | `POST /login` |
| Cadastro | `POST /user` |
| Perfil | `GET /user`, `PUT /user`, `PUT /user/upload`, `DELETE /user` |
| Receitas | `GET/POST /recipes`, `GET /recipes/:id/temperatures` (contagem e faixa de cada receita), `DELETE /recipes/:id` |
| Receita | `GET/PUT/DELETE /recipes/:id`, `GET /recipes/:id/temperatures` |
| Nova rampa | `GET /recipes/:id`, `POST /recipes/:id/temperatures` |
| Editar rampa | `GET /recipes/:id`, `GET /recipes/:id/temperatures`; salvar ainda não tem rota na API (#97) |

As telas internas também chamam `GET /user` para preencher o topo. Lotes, análises e o teste de iodo ainda não têm rota na API: mostram dados de exemplo e avisam em vez de salvar (#31, #92, #1, #3). A leitura do iodo será feita pelo Back-End com Python e OpenCV (#34); o usuário não envia foto.

## Documentação

- `codemap.md`: atlas do repositório e mapas por diretório.
- `AGENTS.md`: regras de trabalho no repositório.
- `docs/codebase/`: stack, estrutura, arquitetura, convenções, integrações, testes e riscos.
- `docs/frontend-screens.md` e `docs/frontend-components.md`: inventário de telas e componentes.

## Receitas e rampas: integração da #86

O navegador consome `GET/POST /recipes`, `GET /recipes/:id` e `GET/POST /recipes/:id/temperatures` da #32. Lista em `recipes`, detalhe em `recipe` e rampas em `temperatures`. A tela usa `minTemperatureRamp`, `maxTemperatureRamp`, `minTemperatureLimit`, `maxTemperatureLimit`, `timer`, `initialization`, `idealTime` e `orderRamp` opcional. Temperaturas inteiras entre 0 e 100 °C, mínimo ≤ máximo; horários HH:MM:SS.

Rotas de tela: `/recipes` (`recipes.ejs`), `/recipes/:id` e `/recipes/:id/edit` (`recipe.ejs`), `/recipes/:id/temperatures/new` e `/recipes/:id/temperatures/:temperatureId/edit` (`temperatureForm.ejs`). Edição e exclusão de rampas permanecem na #97.

Detalhe, criação, edição do nome e exclusão de receita usam chamadas reais com Bearer. PUT/DELETE existentes foram alinhados ao caminho em inglês para preservar a interface; a conclusão das regras da #93, incluindo vínculo com lotes, continua naquela issue. Perfil mantém phone/urlImage da #71. O design atual é mantido pela regra da #78, sem bloqueio por desenho ausente. Validação pública ainda depende do deploy #68/#69; evidência local não equivale a deploy.
