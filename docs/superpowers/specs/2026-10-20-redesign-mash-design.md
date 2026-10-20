# Redesign das telas do MASH (Pen)

Data: 2026-10-20

## Objetivo

Redesenhar no Pen as 12 telas migradas do Figma (`prototipo (cópia)`), melhorando UI e UX sem mudar o produto: mesmas telas, mesmos fluxos, mesmos dados. As telas migradas continuam intactas no arquivo; o redesign fica numa seção nova abaixo delas.

Contexto de produto em `PRODUCT.md`: cervejeiro artesanal hobbista, apoio ao teste de iodo na mosturação, uso no computador e no celular perto da panela.

## Decisões confirmadas

- Direção: estrutura de painel limpo (proposta B), com as cores da marca.
- Header marrom `#4E342E` na área de conteúdo, com trilha, notificações e usuário.
- Sidebar branca com logo, recolhível no desktop: 288px aberta, 80px fechada (só ícones). No mobile vira drawer com overlay.
- Laranja `#E87600` nas ações primárias, `#F57C00` no item ativo e no foco.
- Poppins nos títulos e números, Roboto na interface.
- Ícones Phosphor.
- Desktop 1920×1080 e mobile 390×844.

## Telas

Desktop: Login, Cadastro, Recuperar senha, Código de verificação, Redefinir senha, Receitas (lista), Receitas (vazia), Receitas com modal de novo processo, Processos da receita, Temperatura, Temperatura com pré-definições, Iodo, Lotes, Lotes com sidebar recolhida.

Mobile: Login, Receitas, menu aberto, Temperatura, Lotes.

## Melhorias de UX

- Temperatura e Iodo como etapas ("1 Temperatura → 2 Iodo") com Voltar e Continuar/Finalizar.
- Campos com unidade (ºC, min, testes), texto de ajuda e erro na linha; exemplo de erro quando a mínima é maior que a máxima.
- Selos de status com texto, nunca só cor.
- Exclusão com confirmação.
- Estados vazio e de erro com mensagem e próxima ação.
- Ação primária à direita nos formulários; alvos de toque de 44px ou mais.

## Componentes no Pen

Campo, botão (primário, secundário, perigo, fantasma), selo, item de menu (aberto e fechado), sidebar (aberta e fechada), header, linha de tabela, modal e alerta.

## Restrições

- Telas de iodo, edição de temperatura e recuperação de senha não têm rota na API; o design não sugere persistência que não existe.
- Dados nas telas são exemplos.
- Nada no código do frontend muda nesta etapa.

## Revisão: alinhamento com a API (20/10/2026)

Conferido com `conloq/Back-End` (`main`) e com os contratos das issues de `conloq/mash` (#1, #3, #31, #33, #75, #92, #97).

- Removido: etapa "Iodo" da receita (sem entidade na API), "Tempo ideal" calculado (é o campo `idealTime` de cada rampa), temperatura ao vivo e próxima coleta (IoT, próximo semestre), sino com contador (alertas #48, próximo semestre), selo de iodo nas receitas.
- Ajustado: Receitas (rampas, faixa e data de criação), detalhe da receita (colunas da rampa), Lotes (`mashStart`, status `active`/`completed`, contagem de análises), textos de Login e Cadastro.
- Novas telas: Renomear receita, Nova receita com 409, Nova rampa com erro de validação, Editar rampa, Perfil e Excluir conta, Novo lote, Detalhe do lote com histórico de análises, Editar lote, Excluir lote com 409, Enviar teste de iodo (e arquivo inválido), Resultado da análise e os quatro estados, e as versões mobile de envio, resultado, detalhe do lote e perfil.
- Sem rota na API: recuperação de senha (marcada no nome das telas) e Painel.
