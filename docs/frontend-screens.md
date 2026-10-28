# Mapa de Telas Frontend

## Telas públicas

| Tela | Rota | Componente | Composição visual |
|---|---|---|---|
| Login | `/login` | `LoginContent` em `AuthLayout` | Painel da marca, e-mail, senha com mostrar/ocultar, "Esqueceu a senha?" e link de cadastro. |
| Cadastro | `/signup` | `SignupContent` em `AuthLayout` | Nome, e-mail, senha e confirmação com erro no campo. |
| Recuperar senha | `/forgot-password`, `/forgot-password/code`, `/forgot-password/reset` | `ForgotPasswordContent` (`etapa`) | Barra da marca, espuma ao fundo e card central no desktop; passo 1 de 3; código em 6 caixas e "Reenviar" com contagem; formulários `data-sem-api` (conloq/mash#73). |

## Telas autenticadas

| Tela | Rota | Componente | Composição visual |
|---|---|---|---|
| Painel | `/dashboard` | `DashboardContent` | Indicadores com "—" e cards em estado vazio. |
| Perfil | `/profile` | `ProfileContent` | Foto (troca envia na hora), dados da conta, troca de senha, últimos acessos e exclusão com confirmação. |
| Últimos acessos | `/profile/access-history` | `AccessHistory` | Histórico de logins (`GET /user/login-history`; `404` = "Nenhum acesso registrado"). |
| Configuração | `/settings`, `/settings/security` | `SettingsContent` | Abas Acessibilidade e Segurança; salvar só bloqueia o envio. |
| Receitas | `/recipes` | `RecipesContent` | Busca, contagem, tabela (cards no mobile), modal "Nova receita" e exclusão com confirmação. |
| Receita | `/recipes/:id`, `/recipes/:id/edit` | `RecipeContent` | Rampas, perfil das rampas, modal Renomear, exclusão e link para o teste de iodo. |
| Teste de iodo da receita | `/recipes/:id/iodine` | `RecipeIodineContent` | Rampa do teste, coletas e prévia da sessão; salvar é `data-sem-api` (conloq/mash#101). |
| Rampa de temperatura | `/recipes/:id/temperatures/new`, `/recipes/:id/temperatures/:temperatureId/edit` | `TemperatureContent` | Faixa, tempos e limites com erro por campo; na edição, salvar e excluir só bloqueiam (conloq/mash#97). |
| Lotes | `/lots`, `/lots/new` | `LotsContent` | Tabela em estado vazio; `/lots/new` abre o modal com receitas reais. |
| Lote | `/lots/:id`, `/lots/:id/edit` | `LotDetail` | Leituras, receita e temperatura em estado vazio; `/edit` abre o modal; excluir é `data-sem-api`. |
| Monitoramento | `/lots/:id/monitoring` | `LotMonitoring` | Histórico de conversão, registros e temperatura em estado vazio. |
| Sessão do iodo | `/lots/:id/iodine`, `/lots/:id/iodine/reading` | `IodineSession` | Câmera desconectada, calibração pendente, capturas vazias. |
| Teste de iodo | `/analyses/new` | `IodineDemoContent` | Simulação das coletas, sem envio de imagem nem persistência e sem rótulo de simulação. |
| Análise | `/analyses/:id` | página própria | Card "Captura e resultado" em estado vazio. |

## Estados que devem ser capturados para referência visual

1. Login e cadastro vazios, e com erro da API.
2. Perfil com dados, com erro de campo e com a confirmação de exclusão aberta.
3. Receitas com linhas, vazia e com o modal "Nova receita".
4. Receita com rampas, perfil das rampas e modal Renomear.
5. Sidebar desktop expandida e recolhida (e mantida ao trocar de página); gaveta mobile com overlay.
6. Rampa em criação, com erros, e em edição.
7. Configuração nas duas abas.
8. Recuperação de senha nas três etapas.
9. Teste de iodo em andamento e concluído (simulação).
10. Lotes, sessão do iodo e análise em estado vazio.

## Relação tela → componentes

- Telas logadas usam `AppShell`; telas de acesso usam `AuthLayout` (a recuperação de senha tem layout próprio).
- Listas e formulários usam `Field`, `Modal`, `ConfirmDialog` e `EmptyState` de `Feedback`.
- `RecipeContent` exporta `useReceita()` e `minutos()`, reaproveitados por `TemperatureContent` e `RecipeIodineContent`.
- `LotsContent` exporta `LotForm`, usado também por `LotDetail`.

## Evidências

- `src/pages/`
- `src/components/`
