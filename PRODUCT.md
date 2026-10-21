# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cervejeiro artesanal que produz cerveja por hobby, em pequena escala. Durante a mosturação ele acompanha temperatura e tempo e precisa decidir quando a conversão do amido terminou. Consulta o sistema no computador e no celular, perto da panela, muitas vezes com as mãos ocupadas.

## Product Purpose

O MASH apoia o acompanhamento da mosturação com receitas e rampas de temperatura. A leitura automatizada do teste de iodo é uma visão futura do produto: OpenCV e todo o fluxo real de imagem, análise e histórico ficam no backlog para o próximo semestre. Neste semestre, o teste de iodo aparece somente como simulação no frontend; a cena correspondente é obrigatória no pitch e deve ser apresentada sem etiqueta de simulação.

## Positioning

Controladores de rampa térmica garantem a temperatura, mas não dizem se ainda há amido residual. Como visão futura, o MASH relaciona o acompanhamento de temperatura e tempo ao teste de iodo e à rastreabilidade por lote. A entrega deste semestre não classifica amostras nem registra análises reais e não se apresenta como substituto de análise laboratorial quantitativa.

## Operating Context

- Escopo observado no código do depósito: conta, receitas e criação/listagem de rampas. Lotes permanecem planejados. A tela do teste de iodo é uma simulação de frontend, sem envio de imagem, análise real ou persistência.
- Backlog para o próximo semestre, sem Sprint: OpenCV e o fluxo real de imagem, armazenamento, análise, consulta e histórico (#34 e issues relacionadas). Leitura automática de temperatura e alertas também são futuros.
- A cena do teste de iodo é obrigatória no pitch (#25, #28), usando a simulação frontend e sem etiqueta de simulação na cena.

## Capabilities and Constraints

- Frontend EJS + Tailwind CSS v4 + JavaScript vanilla; a API REST (`conloq/Back-End`) tem as regras, o banco e o JWT. Rotas atualmente observadas: `/login`, `/user`, `/user/upload`, `/recipes`, `/recipes/:id` e `/recipes/:id/temperatures`. Lotes e análises reais não têm rotas implementadas neste escopo.
- Já no código da API: login, operações de usuário, CRUD de receitas e criação/listagem de rampas. A edição/exclusão de rampas (#97) ainda não está concluída; lotes e análises reais permanecem planejados para outro semestre, sem Sprint, conforme o recorte vigente (#31, #92, #33, #1, #3 e #34).
- Restrições planejadas para o fluxo futuro: imagens JPEG ou PNG até 10 MB e lote com análises não pode ser excluído (409). Para o código atual, temperaturas são inteiras de 0 a 100 ºC, mínima nunca maior que a máxima, e horários `HH:MM:SS`.
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
