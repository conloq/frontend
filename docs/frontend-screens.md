# Mapa de Telas Frontend

## Telas públicas

| Tela | Rota | Componente | Composição visual |
|---|---|---|---|
| Login | `/login` | `LoginContent` em `AuthLayout` | Painel da marca, e-mail, senha com mostrar/ocultar, "Esqueceu a senha?" e link de cadastro. |
| Cadastro | `/signup` | `SignupContent` em `AuthLayout` | Nome, e-mail, senha e confirmação com erro no campo. |

## Telas autenticadas

| Tela | Rota | Componente | Composição visual |
|---|---|---|---|
| Perfil | `/profile` | `ProfileContent` | Foto (troca envia na hora), dados da conta, troca de senha, últimos acessos e exclusão com confirmação. |
| Últimos acessos | `/profile/access-history` | `AccessHistory` | Histórico de logins (`GET /user/login-history`; `404` = "Nenhum acesso registrado"). |
| Receitas | `/recipes` | `RecipesContent` | Busca, contagem, tabela (cards no mobile), modal "Nova receita" e exclusão com confirmação. |
| Receita | `/recipes/:id`, `/recipes/:id/edit` | `RecipeContent` | Rampas, exclusão de rampa, card "Lotes desta receita", perfil das rampas com grade de 10 ºC, modal Renomear, exclusão e link para o teste de iodo. |
| Rampa de temperatura | `/recipes/:id/temperatures/new`, `/recipes/:id/temperatures/:temperatureId/edit` | `TemperatureContent` | Faixa, tempos e limites com erro por campo; na edição, salva e exclui a rampa. |
| Lotes | `/lots`, `/lots/new` | `LotsContent` | Tabela de lotes (nome, receita, criação, status); `/lots/new` abre o modal e cria o lote. |
| Lote | `/lots/:id`, `/lots/:id/edit` | `LotDetail` | Nome, status, receita e início da mosturação; `/edit` abre o modal preenchido; exclusão com confirmação. Leituras e temperatura em estado vazio. |
| Monitoramento | `/lots/:id/monitoring` | `LotMonitoring` | Histórico de conversão, registros e temperatura em estado vazio. |
| Sessão do iodo | `/lots/:id/iodine`, `/lots/:id/iodine/reading` | `IodineSession` | Câmera desconectada, calibração pendente, capturas vazias. |
| Teste de iodo | `/analyses/new` | `IodineDemoContent` | Simulação em duas etapas, como no Figma: preparar sessão (padrão branco, controles positivo e negativo) e leitura automática (capturas a cada 10 min simulados, escala, lista e gráfico de temperatura). Sem envio de imagem, sem persistência e sem rótulo de simulação. |

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
- `RecipeContent` exporta `useReceita()` e `minutos()`, reaproveitados por `TemperatureContent`.
- `LotsContent` exporta `LotForm`, usado também por `LotDetail`.

## Evidências

- `src/pages/`
- `src/components/`
