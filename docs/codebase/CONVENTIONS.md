# Conventions

## 1. Arquivos e módulos

- Projeto usa ES modules (`"type": "module"`).
- Imports são relativos e incluem `.js`.
- Controllers, routers e middleware usam nomes camelCase em arquivo, por exemplo `receitaController.js` e `usuarioRoutes.js`.
- Modelos normalmente usam PascalCase (`Usuario.js`, `Receita.js`), com `log.js` como exceção existente.
- Templates usam extensão `.ejs`; partials ficam em `views/partials/`.

## 2. Funções e variáveis

- Funções de controller seguem verbos em camelCase: `getReceita`, `postReceita`, `updateTemperatura`, `defineTemperatura`.
- Variáveis de request e domínio também usam camelCase: `receitaId`, `temperaturaId`, `tempoIdeal`.
- Colunas persistidas usam snake_case: `usuario_id`, `receita_id`, `temp_maxima_limite`.
- Nomes de campos de formulários fazem parte do contrato entre EJS e controller. O caso verificado é `limiteMaximoTemperatura` em `views/editarTemperatura.ejs` e `updateTemperatura`.

## 3. Rotas e respostas

- Rotas são declaradas com `express.Router()` e montadas por `index.js`.
- Controllers usam `res.render()` para páginas e `res.redirect()` após operações de formulário.
- Não foi encontrado padrão uniforme de status HTTP ou resposta JSON.
- Formulários usam POST para criação/edição; logout e exclusão usam GET conforme as rotas atuais.

## 4. Erros e logging

- Controllers usam `try/catch` local.
- Erros são registrados principalmente por `console.log` ou `console.error`.
- Em vários caminhos, após capturar erro, não há resposta HTTP explícita; comportamento de erro pode ficar inconsistente.
- Não foi encontrada biblioteca de logging estruturado.

## 5. Frontend

- Comportamento do navegador fica em `public/js/script.js`.
- O script usa seletores defensivos com `?.` para funcionar em páginas que não possuem determinado elemento.
- CSS fonte: `public/css/tailwind.css`.
- CSS gerado: `public/css/style.css`; não deve ser editado manualmente.
- Ícones usam Phosphor servido por `/vendor/phosphor`.

## 6. Ferramentas de qualidade

- Linter e formatter: [TODO] não há configuração identificada.
- TypeScript: não utilizado; opções de strictness não se aplicam.
- Testes automatizados: [TODO] não implementados.

## 7. Evidências existentes

- `package.json`
- `index.js`
- `controller/receitaController.js`
- `routes/*.js`
- `views/editarTemperatura.ejs`
- `public/js/script.js`
- `public/css/tailwind.css`
- `AGENTS.md`

## Evidências

- `package.json`
- `index.js`
- `controller/receitaController.js`
- `routes/receitaRoutes.js`
- `views/editarTemperatura.ejs`
- `public/js/script.js`
- `public/css/tailwind.css`
