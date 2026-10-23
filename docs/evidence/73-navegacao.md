# #73: navegação, ações e estados das telas

Conferido em 23/10/2026. Frontend `69d2b14` mais a correção deste PR; Back-End `b65ca02` local, num banco novo e descartável (apagado depois). Usei duas contas de teste: A navegou, e B só deu a receita alheia para o teste de 404. O login foi feito pelo `#formLogin`.

## Links e botões

| Conferência | Resultado |
|---|---|
| 25 rotas de tela do `index.js` | todas respondem 200 |
| 248 links nessas telas (19 destinos) | nenhum destino quebrado; os 3 `href="#"` de `recipe.ejs` recebem a rota pelo `app.js` quando a receita carrega |
| 47 botões nas views | todos enviam formulário, têm handler no `app.js`/`script.js` ou têm `data-sem-api`; 3 botões da sessão de iodo ficam `disabled` de propósito (câmera desconectada, como no design) |

## Estados (celular, cerca de 410 px)

| Tela | Estado | O que apareceu | Captura |
|---|---|---|---|
| `/recipes` | vazio | "Nenhuma receita cadastrada", com "Criar primeira receita" | `73-screens/mobile-receitas-vazia.jpg` |
| `/recipes` | criar pela tela | o modal cria a receita, mostra o aviso "Receita criada com sucesso" e a receita entra na lista | — |
| `/recipes/:id/temperatures/new` | erro de validação | "Confira os campos marcados", com "Precisa ser igual ou maior que a mínima (70 ºC)" no campo Máxima | `73-screens/mobile-rampa-erro-validacao.jpg` |
| `/recipes/:id` | rampa salva | aviso "Temperatura criada com sucesso", a rampa 70 a 72 ºC na lista e o perfil das rampas | `73-screens/mobile-rampa-salva.jpg` |
| `/recipes/<id da conta B>` | 404 alheio | "Receita não encontrada", sem dados da outra conta. **Antes:** Excluir, Renomear, Teste de iodo e Adicionar rampa continuavam na tela. **Depois:** só o alerta e o voltar | `73-screens/mobile-receita-alheia-antes.jpg`, `73-screens/mobile-receita-alheia-depois.jpg` |
| `/recipes` | erro da API (API parada) | "Não foi possível conectar ao servidor", com "Tentar de novo" | `73-screens/mobile-receitas-erro-api.jpg` |
| `/recipes`, rampas, acessos | carregando | conferido no código: `listaCarregando()` (`app.js`) desenha o `tplCarregando` com `aria-busy` antes de cada chamada | — |
| `/analyses/new` | simulação do iodo | 4 coletas, de "Amido presente" a "Sem amido detectável", "Pronto para a fervura" e "Teste concluído"; "Iniciar teste" fica desativado durante o teste | `73-screens/mobile-iodo-concluido-1.jpg`, `-2.jpg` |

## Desktop (1440 px)

O navegador integrado do Pen não pinta bem a tela com a emulação de 1440 px, então a conferência foi pelo DOM, com a página num iframe de 1440 × 900. `/recipes`, `/recipes/:id`, `/recipes/<id alheio>`, `/recipes/:id/temperatures/new`, `/profile`, `/lots`, `/analyses/new` e `/settings` ficaram sem rolagem horizontal. Na receita própria, as ações estão visíveis; na alheia, só aparece o alerta.

Não comprova o ambiente publicado (#68 e #69).
