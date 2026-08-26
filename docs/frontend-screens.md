# Mapa de Telas Frontend

## Telas públicas

| Tela | Template | Composição visual |
|---|---|---|
| Login | `views/login.ejs` | Header/footer, formulário de autenticação, campos de e-mail e senha, link de cadastro. |
| Cadastro | `views/cadastro.ejs` | Header/footer, formulário de criação de conta e confirmação visual de senha. |

## Telas autenticadas

| Tela | Template | Composição visual |
|---|---|---|
| Perfil | `views/usuario.ejs` | Shell autenticado, dados do perfil, edição, upload/preview de foto, histórico e modal de exclusão. |
| Receitas | `views/receita.ejs` | Shell autenticado, título, botão de criação, listagem tabular, ações de temperatura/exclusão e modal de criação. |
| Adicionar temperatura | `views/adicionarTemperatura.ejs` | Shell autenticado, navegação Temperatura/Iodo, formulário de rampas, limites e temporização. |
| Editar temperatura | `views/editarTemperatura.ejs` | Shell autenticado, navegação Temperatura/Iodo, formulário preenchido e seleção da temperatura ativa. |
| Adicionar iodo | `views/adicionarIodo.ejs` | Shell autenticado, navegação Temperatura/Iodo e formulário de coleta, intervalo e quantidade máxima. |
| Editar iodo | `views/editarIodo.ejs` | Shell autenticado, navegação Temperatura/Iodo e formulário preenchido de configuração de iodo. |

## Estados que devem ser capturados para referência visual

1. Login vazio.
2. Cadastro vazio.
3. Perfil em modo leitura.
4. Perfil em modo edição.
5. Perfil com modal de foto aberto.
6. Receitas com uma ou mais linhas.
7. Receitas sem valores de temperatura.
8. Modal `Criar processo` aberto.
9. Sidebar desktop expandida.
10. Sidebar desktop recolhida.
11. Drawer mobile aberto com overlay.
12. Formulário de temperatura em criação.
13. Formulário de temperatura em edição.
14. Formulário de iodo em criação.
15. Formulário de iodo em edição.

## Relação tela → componentes

- Todas as telas usam `header.ejs` e `footer.ejs`.
- Telas autenticadas usam `sidebar.ejs` e `topBar.ejs`.
- `receita.ejs` usa listagem, ações icon-only e modal.
- `usuario.ejs` usa formulário, modal e preview de imagem.
- Telas de temperatura e iodo usam cards de formulário e navegação entre configurações.

## Evidências

- `views/login.ejs`
- `views/cadastro.ejs`
- `views/usuario.ejs`
- `views/receita.ejs`
- `views/adicionarTemperatura.ejs`
- `views/editarTemperatura.ejs`
- `views/adicionarIodo.ejs`
- `views/editarIodo.ejs`
- `views/partials/header.ejs`
- `views/partials/footer.ejs`
- `views/partials/sidebar.ejs`
- `views/partials/topBar.ejs`
- `public/js/script.js`
