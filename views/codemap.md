# views/

Templates EJS das páginas do Sistema MASH. Dados da API chegam como locais enviados por `controllers/pageController.js` em `res.render(view, locals)` e são impressos com `<%= ... %>` para manter escape HTML. Formulários POST vão ao controller; `public/js/app.js` trata validações e interações.

## Páginas

- `dw2Example.ejs`: exemplo didático independente de lista enviada pelo `res.render`.
- `profile.ejs`: recebe `user`, `acessos` e `erroAcessos`; valores de nome, telefone, e-mail, foto e criação são renderizados no servidor. `cardAcessos.ejs` renderiza a lista.
- `accessHistory.ejs`: histórico renderizado pelo mesmo partial.
- `recipes.ejs`: recebe `receitas` com rampas/faixas do controller e renderiza as linhas no EJS.
- `recipe.ejs`: recebe `recipe`, `rampas` e `erroRampas`; renderiza detalhe e linhas. O JavaScript usa apenas `data-rampas` para desenhar o gráfico derivado.
- `recipeIodine.ejs`: recebe receita e rampas para seleção e prévia do formulário.
- `temperatureForm.ejs`: recebe usuário, receita, temperatura e `editando`.
- `lots.ejs` e `lot.ejs`: recebem receitas reais para o seletor quando necessário; demais dados de lotes permanecem vazios até a API oferecer rotas.
- Outras views autenticadas recebem `user` para a top bar; estados sem dados da API permanecem honestos.

## Partial composition

`header.ejs`/`footer.ejs` envolvem as páginas. `shellInicio.ejs` compõe sidebar, top bar e mensagens; `shellFim.ejs` fecha a estrutura. `topBar.ejs` mostra `user.name`, `user.email` e `user.urlImage` por EJS. `footer.ejs` contém o diálogo de confirmação e o molde de alertas de validação; não publica `API_URL`.

Preserve IDs e atributos usados pelo JavaScript em `public/js/app.js` e `public/js/script.js`, além dos estados acessíveis e componentes Tailwind existentes.
