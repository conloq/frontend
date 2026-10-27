# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cervejeiro artesanal que produz cerveja por hobby, em pequena escala. Durante a mosturação ele acompanha temperatura e tempo e precisa decidir quando a conversão do amido terminou. Consulta o sistema no computador e no celular, perto da panela, muitas vezes com as mãos ocupadas.

## Product Purpose

O MASH apoia o acompanhamento da mosturação com receitas, rampas de temperatura, lotes e leituras do teste de iodo. O recorte do que entra neste semestre e do que fica planejado está centralizado na [conloq/mash#66](https://github.com/conloq/mash/issues/66) e em [conloq/documentation/geral/README.md](https://github.com/conloq/documentation/blob/main/geral/README.md).

## Positioning

Controladores de rampa térmica garantem a temperatura, mas não dizem se ainda há amido residual. Como visão futura, o MASH relaciona o acompanhamento de temperatura e tempo ao teste de iodo e à rastreabilidade por lote. A entrega deste semestre não classifica amostras nem registra análises reais e não se apresenta como substituto de análise laboratorial quantitativa.

## Operating Context

- Escopo observado no código atual: conta, receitas, criação/listagem de rampas e simulação do teste de iodo no frontend. Lotes (#31, #58, #92) e edição/exclusão de rampas (#97) estão planejados na Sprint 5; as demais entregas futuras seguem na [conloq/mash#66](https://github.com/conloq/mash/issues/66).

## Capabilities and Constraints

- Frontend EJS + Tailwind CSS v4 + JavaScript vanilla, com sessão persistida na tabela `sessions` do MySQL e cookie `HttpOnly`; o servidor Express (`controllers/pageController.js`) chama a API REST (`conloq/Back-End`). Rotas da API atualmente consumidas: `/login`, `/user`, `/user/upload`, `/recipes`, `/recipes/:id` e `/recipes/:id/temperatures`.
- Já no código da API: login, operações de usuário, CRUD de receitas e criação/listagem de rampas. A edição/exclusão de rampas (#97) e o CRUD de lotes (#31 e #92) pertencem ao escopo planejado da Sprint 5 (#66).
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
