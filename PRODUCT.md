# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cervejeiro artesanal que produz cerveja por hobby, em pequena escala. Durante a mosturação ele acompanha temperatura e tempo e precisa decidir quando a conversão do amido terminou. Consulta o sistema no computador e no celular, perto da panela, muitas vezes com as mãos ocupadas.

## Product Purpose

O MASH monitora a etapa de mosturação e, como objetivo do projeto, automatiza a leitura do teste de iodo com visão computacional (Python e OpenCV; a classificação entra no próximo semestre). Tira do olho humano a interpretação da cor da reação, que muda com a iluminação, os reflexos e as gradações intermediárias, e registra cada leitura com data, hora, temperatura e tempo de mosturação. Sucesso é o cervejeiro saber, com confiança, se o mosto pode seguir para a fervura, e poder revisar depois a decisão de cada lote.

## Positioning

Controladores de rampa térmica garantem a temperatura, mas não dizem se ainda há amido residual. O MASH liga o controle de temperatura e tempo à confirmação da conversão pelo teste de iodo e guarda a evidência por lote. Não se apresenta como substituto de análise laboratorial quantitativa.

## Operating Context

- Fluxo do depósito (03/11/2026): cadastrar receitas; adicionar rampas de temperatura a cada receita (faixa mínima/máxima, limites aceitáveis, temporizador, início do timer, tempo ideal e ordem); criar lotes a partir das receitas (nome, receita, início da mosturação, status `active`/`completed`); enviar a foto de cada coleta do teste de iodo para o lote, com data e hora da coleta e temperatura digitada pelo operador; consultar a análise e o histórico do lote.
- No depósito, toda análise fica em `processing` com `result: null`. A classificação por visão computacional (OpenCV, conloq/mash#34), a leitura automática de temperatura por dispositivo e os alertas (conloq/mash#36, #45–#48) são do próximo semestre.
- O resultado do iodo, quando existir, tem `status` `processing`, `completed`, `inconclusive` ou `failed` e `result` `STARCH_PRESENT` (amido presente), `PARTIAL_CONVERSION` (conversão parcial) ou `NO_DETECTABLE_STARCH` (sem amido detectável).
- A API não devolve a imagem enviada (`imageKey` é interno): as telas não mostram a foto depois do envio.

## Capabilities and Constraints

- Frontend EJS + Tailwind CSS v4 + JavaScript vanilla; a API REST (`conloq/Back-End`) tem as regras, o banco e o JWT. Rotas da API em inglês: `/login`, `/user`, `/recipes`, `/recipes/:id/temperatures`, `/temperatures/:id`, `/lots`, `/lots/:id/analyses`, `/analyses/upload`, `/analyses/:id`.
- Já na API: login, usuário (criar, ver, editar, foto, excluir), receitas (CRUD) e criar/listar rampas. Planejado para o depósito: editar/excluir rampa (#97), lotes (#31, #92), upload, consulta e histórico de análises (#33, #1, #3).
- Validações da API que as telas repetem: temperaturas inteiras de 0 a 100 ºC, mínima nunca maior que a máxima, horários `HH:MM:SS`, imagem JPEG ou PNG até 10 MB, nome de receita único por usuário (409 "Receita já existe"), lote com análises não pode ser excluído (409).
- Sem rota e sem issue: recuperação de senha e painel (dashboard). Telas dessas áreas são só layout e precisam dizer isso.
- Termos do domínio em pt-BR: receita, processo, lote, mosturação, rampa de temperatura, teste de iodo, coleta, fervura.

## Brand Commitments

- Nome MASH, logo redondo e emblema da caneca (`docs/design` / exportados do Figma).
- Cores de marca marrom (#4E342E) e laranja (#E87600 / #F57C00).
- Tipografia Poppins (títulos) e Roboto (interface).
- Ícones Phosphor.

## Evidence on Hand

- Artigo acadêmico "Plataforma de Monitoramento da Etapa de Mosturação na Fabricação de Cerveja Artesanal" (coordenação `team-lead/referencias/artigo/main.pdf`).
- Protótipo Figma `prototipo (cópia)` e sua migração para o Pen.
- Não há métricas de acurácia, depoimentos ou usuários reais; não inventar números nem resultados.

## Product Principles

1. A decisão do cervejeiro vem primeiro: o estado da mosturação e o resultado do iodo precisam ser legíveis de relance.
2. Rastreabilidade honesta: toda leitura tem contexto (hora, temperatura, tempo) e nenhum estado finge sucesso que a API não confirmou.
3. Apoio, não substituto: a interface comunica confiança e incerteza (inconclusivo) sem prometer análise laboratorial.
4. Uso na bancada: alvos de toque grandes, contraste alto e leitura à distância.

## Accessibility & Inclusion

Alvos de toque de no mínimo 44px (já exigido em AGENTS.md); contraste suficiente para leitura em ambiente de produção com iluminação variável; cor nunca é o único sinal do resultado do iodo.
