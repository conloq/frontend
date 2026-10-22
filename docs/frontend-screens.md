# Mapa de Telas Frontend

## Telas públicas

| Tela | Template | Composição visual |
|---|---|---|
| Login | `views/login.ejs` | Header/footer, formulário de autenticação, campos de e-mail e senha, link de cadastro. |
| Cadastro | `views/signup.ejs` | Header/footer, formulário de criação de conta e confirmação visual de senha. |

## Telas autenticadas

| Tela | Rota | Template | Composição visual |
|---|---|---|---|
| Perfil | `/profile` | `views/profile.ejs` | Shell autenticado, dados do perfil, edição, foto com preview e exclusão da conta com diálogo de confirmação. |
| Receitas | `/recipes` | `views/recipes.ejs` | Shell autenticado, título, botão "Nova receita", listagem tabular e modal de criação. |
| Receita | `/recipes/:id`, `/recipes/:id/edit` | `views/recipe.ejs` | Shell autenticado, rampas da receita, modal de renomear, exclusão e ações de editar/excluir rampa. |
| Rampa de temperatura | `/recipes/:id/temperatures/new`, `/recipes/:id/temperatures/:temperatureId/edit` | `views/temperatureForm.ejs` | Shell autenticado, formulário de rampas, limites e temporização, com erro por campo; na edição, salvar não envia nada e não mostra aviso, porque a API ainda não tem rota (#97). |
| Painel | `/dashboard` | `views/dashboard.ejs` | Indicadores com "—" e cards em estado vazio. |
| Lotes | `/lots`, `/lots/:id`, `/lots/:id/monitoring` | `views/lots.ejs`, `views/lot.ejs`, `views/lotMonitoring.ejs` | Layout completo em estado vazio, sem registros fictícios; excluir lote é `data-sem-api`. |
| Novo e editar lote | `/lots/new`, `/lots/:id/edit` | modal `views/partials/modalLote.ejs` sobre a lista e o detalhe | Receitas reais no seletor (`GET /recipes`); salvar é `data-sem-api`. |
| Sessão do iodo | `/lots/:id/iodine`, `/lots/:id/iodine/reading` | `views/iodineSession.ejs` | Câmera desconectada, calibração pendente, capturas vazias. |
| Recuperar senha | `/forgot-password`, `/codigo`, `/redefinir` | `views/forgotPassword.ejs` | Páginas públicas; código de 6 dígitos; formulários `data-sem-api`. |
| Teste de iodo | `/analyses/new` | `views/iodineDemo.ejs` | Shell autenticado e simulação de frontend das coletas, sem envio de imagem nem persistência. |
| Análise | `/analyses/:id` | `views/analysis.ejs` | Shell autenticado e estado de indisponibilidade (consulta sem rota na API). |

## Estados que devem ser capturados para referência visual

1. Login vazio.
2. Cadastro vazio.
3. Perfil em modo leitura.
4. Perfil em modo edição.
5. Perfil com exclusão de conta aberta (diálogo de confirmação).
6. Receitas com uma ou mais linhas.
7. Receitas sem receitas (estado vazio).
8. Modal `Nova receita` aberto.
9. Receita com rampas e modal `Renomear` aberto.
10. Sidebar desktop expandida.
11. Sidebar desktop recolhida.
12. Drawer mobile aberto com overlay.
13. Formulário de rampa em criação.
14. Formulário de rampa em edição.
15. Teste de iodo em andamento (simulação).
16. Lotes e análise em estado de indisponibilidade.

## Relação tela → componentes

- Todas as telas usam `header.ejs` e `footer.ejs`.
- Telas autenticadas usam `shellInicio.ejs` (com `sidebar.ejs` e `topBar.ejs`) e `shellFim.ejs`.
- `recipes.ejs` e `recipe.ejs` usam listagem, ações icon-only e modais; as linhas vêm de `<template>`.
- `profile.ejs` usa formulário, diálogo de confirmação e preview de imagem.
- `temperatureForm.ejs` usa cards de formulário com erro por campo.
- `dashboard.ejs`, `lots.ejs`, `lot.ejs`, `lotMonitoring.ejs` e `iodineSession.ejs` usam o partial `estadoVazio.ejs`, sem chamada à API além de `GET /user`; `analysis.ejs` mantém o card de indisponibilidade (`#tituloIndisponivel`).

## Evidências

- `index.js`
- `views/login.ejs`
- `views/signup.ejs`
- `views/profile.ejs`
- `views/recipes.ejs`
- `views/recipe.ejs`
- `views/temperatureForm.ejs`
- `views/lots.ejs`
- `views/lot.ejs`
- `views/iodineDemo.ejs`
- `views/analysis.ejs`
- `views/partials/header.ejs`
- `views/partials/footer.ejs`
- `views/partials/shellInicio.ejs`
- `views/partials/shellFim.ejs`
- `views/partials/sidebar.ejs`
- `views/partials/topBar.ejs`
- `public/js/script.js`
- `public/js/app.js`
